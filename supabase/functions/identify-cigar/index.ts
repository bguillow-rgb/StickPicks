// supabase/functions/identify-cigar/index.ts
// Edge Function that proxies cigar identification requests to Claude Vision API.
// Keeps the Anthropic API key server-side — never shipped in the app binary.
//
// Also enforces:
//   - Free-scan quota per durable device_id (so re-signin-as-Guest can't reset it)
//   - Per-user hourly + daily rate limits to prevent cost blowout.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Must mirror the client constants in useScanCount.ts.
const TOTAL_SCAN_LIMIT = 10;
const RATE_LIMIT_HOURLY = 30;
const RATE_LIMIT_DAILY = 100;

// Per-image and aggregate payload bounds (post-Build-16 finding #4).
// Without these, identify-cigar is a DoS + cost amplifier: a client can
// post a 50 MB base64 blob, the server decodes it, ships it to Anthropic
// Vision, and we pay both edge function CPU and per-image API cost before
// the request returns. Caps below: ~1.5 MB decoded per frame is well
// above a typical band shot; 10 MB aggregate covers an 8-frame burst.
const MAX_IMAGE_BASE64_BYTES = 2_000_000;
const MAX_TOTAL_BASE64_BYTES = 10_000_000;
const ALLOWED_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
]);

// Hard timeout on the Anthropic call. Without it, a hung upstream
// exhausts our edge function CPU budget while the user sees a spinner.
const ANTHROPIC_TIMEOUT_MS = 30_000;

const IDENTIFY_PROMPT = `You are a cigar identification expert. You may receive ONE OR MORE photos of the same cigar, taken from different rotation angles while the user rotates it. Use ALL of them together.

STRATEGY when multiple images are given:
- Read every fragment of text visible on the band across all frames.
- Cigar bands wrap around the cigar, so words are often split between frames (e.g. frame 1 shows "PADRÓN", frame 2 shows "1964", frame 3 shows "ANNIVERSARY EXCLUSIVO"). Reconstruct the full band text.
- Cross-reference logos, typography, and colors across frames for consistency.
- A confident ID from multiple angles beats a single-frame guess.

FOCUS on the band text, logo, typography, and colors. The band is the primary signal for brand and line.

IMPORTANT distinctions:
- "brand" = the maker (e.g., "Oliva", "Padron", "Arturo Fuente")
- "line" = the specific product line (e.g., "Serie V Melanio", "1964 Anniversary", "Hemingway")
- "vitola" = the size/shape (e.g., "Robusto", "Toro", "Torpedo"). NEVER put a vitola in the "line" field.

You usually CANNOT determine vitola from a close-up band photo. Only fill in vitola if you see a clear size indicator on the band or packaging. Otherwise, set vitola to null.

Respond ONLY with valid JSON in this exact format:
{
  "brand": "the brand name",
  "line": "the specific cigar line/name, WITHOUT vitola",
  "vitola": "the size if and ONLY if clearly determinable, else null",
  "confidence": 0.85,
  "reasoning": "Brief explanation of how you identified it across the frames"
}

If you cannot identify the cigar, respond with:
{
  "brand": null,
  "line": null,
  "vitola": null,
  "confidence": 0,
  "reasoning": "Explanation of why identification failed"
}`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ImagePayload {
  base64: string;
  mediaType?: string;
}

interface RequestBody {
  images?: ImagePayload[];
  imageBase64?: string;
  mediaType?: string;
  device_id?: string;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      // Log loudly so a key-rotation misconfig is visible in function logs
      // without needing to redeploy to add diagnostics. Client sees a
      // neutral message; operator sees the cause.
      console.error("identify-cigar: ANTHROPIC_API_KEY missing — edge function misconfigured");
      return jsonResponse({ error: "Identification temporarily unavailable" }, 503);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization" }, 401);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({ error: "Invalid or expired token" }, 401);
    }

    const body = (await req.json()) as RequestBody;

    let images: ImagePayload[] = [];
    if (Array.isArray(body.images) && body.images.length > 0) {
      images = body.images;
    } else if (body.imageBase64) {
      images = [{ base64: body.imageBase64, mediaType: body.mediaType }];
    }

    if (images.length === 0) {
      return jsonResponse({ error: "At least one image is required" }, 400);
    }
    if (images.length > 8) {
      return jsonResponse({ error: "Too many frames (max 8)" }, 400);
    }

    // Per-image and aggregate payload bounds + media-type allowlist.
    // Reject early so we never decode an oversized blob or ship an
    // unsupported MIME to Anthropic (which would silently consume API
    // cost and return a useless reply). All checks pre-trim base64.
    let totalBytes = 0;
    for (const img of images) {
      if (typeof img.base64 !== "string" || img.base64.length === 0) {
        return jsonResponse({ error: "Invalid image payload" }, 400);
      }
      if (img.base64.length > MAX_IMAGE_BASE64_BYTES) {
        return jsonResponse({ error: "Image too large (max ~1.5 MB per frame)" }, 413);
      }
      totalBytes += img.base64.length;
      if (totalBytes > MAX_TOTAL_BASE64_BYTES) {
        return jsonResponse({ error: "Total upload too large" }, 413);
      }
      const mt = (img.mediaType ?? "image/jpeg").toLowerCase();
      if (!ALLOWED_MEDIA_TYPES.has(mt)) {
        return jsonResponse({ error: "Unsupported image type" }, 415);
      }
    }

    // --- Free-scan quota enforcement (device-scoped, not user-scoped) ---
    const deviceId = typeof body.device_id === "string" ? body.device_id.trim() : "";
    if (!deviceId) {
      return jsonResponse({ error: "Missing device_id" }, 400);
    }

    // Pro users bypass the device-scoped free-scan cap. NOTE: `body.isPro` is
    // a client-claimed flag (security finding #1: spoofable). Acceptable for
    // the resubmission cycle so Pro users aren't hard-capped at 10 scans —
    // post-approval hardening replaces this with a server-side Pro entitlement
    // check via a RevenueCat webhook + entitlements table.
    const claimedPro = body.isPro === true;

    if (!claimedPro) {
      const { count: deviceScans } = await supabase
        .from("scan_images")
        .select("id", { count: "exact", head: true })
        .eq("device_id", deviceId);

      if ((deviceScans ?? 0) >= TOTAL_SCAN_LIMIT) {
        return jsonResponse(
          { error: "You've hit the free-scan limit. Upgrade to Pro for unlimited scans." },
          429
        );
      }
    }

    // --- Per-user rate limit (abuse prevention) ---
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const [{ count: hourly }, { count: daily }] = await Promise.all([
      supabase
        .from("scan_images")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("scan_method", "concierge")
        .gte("created_at", hourAgo),
      supabase
        .from("scan_images")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("scan_method", "concierge")
        .gte("created_at", dayAgo),
    ]);

    if ((hourly ?? 0) >= RATE_LIMIT_HOURLY || (daily ?? 0) >= RATE_LIMIT_DAILY) {
      return jsonResponse(
        { error: "Too many scans in a short time — please wait a bit before trying again." },
        429
      );
    }

    // After the allowlist gate above, media_type is trusted; no fallback.
    const imageContent = images.map((img) => ({
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: (img.mediaType ?? "image/jpeg").toLowerCase(),
        data: img.base64,
      },
    }));

    let anthropicResponse: Response;
    try {
      anthropicResponse = await fetch(
        "https://api.anthropic.com/v1/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 500,
            messages: [
              {
                role: "user",
                content: [
                  ...imageContent,
                  { type: "text", text: IDENTIFY_PROMPT },
                ],
              },
            ],
          }),
          signal: AbortSignal.timeout(ANTHROPIC_TIMEOUT_MS),
        }
      );
    } catch (err: any) {
      // AbortError when timeout fires, TypeError on network failure.
      const isTimeout = err?.name === "TimeoutError" || err?.name === "AbortError";
      console.error("identify-cigar: anthropic fetch failed", { isTimeout, err });
      return jsonResponse(
        {
          error: isTimeout
            ? "Scanner timed out — please try again."
            : "Cigar identification temporarily unavailable",
        },
        isTimeout ? 504 : 502,
      );
    }

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error("Anthropic API error:", anthropicResponse.status, errorText);
      const clientMessage =
        anthropicResponse.status === 429
          ? "Scanner is busy, please try again in a moment"
          : "Cigar identification temporarily unavailable";
      return jsonResponse({ error: clientMessage }, 502);
    }

    const apiResult = await anthropicResponse.json();
    return jsonResponse(apiResult, 200);
  } catch (err: any) {
    console.error("Edge function error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
