// supabase/functions/delete-account/index.ts
// Deletes the calling user's data + auth row.
// Auth.admin.deleteUser requires the service role key, which only lives server-side here.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Verify caller's JWT — only the user themselves can trigger account deletion.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await admin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = user.id;

    // 2a. Pull cigar_image_submissions BEFORE deleting them so we can also
    // clean up the underlying storage objects. Submissions are stored at
    // `{cigarId}/{userId}/{filename}.jpg` per src/hooks/useCigarImageUpload.ts,
    // so we need each submission's path (recoverable by listing the user's
    // folder under each cigar) — but the simpler approach is to extract paths
    // from the stored image_url, which already encodes the full path.
    let submissionPaths: string[] = [];
    try {
      const { data: submissions } = await admin
        .from("cigar_image_submissions")
        .select("image_url")
        .eq("user_id", userId);
      if (submissions) {
        submissionPaths = submissions
          .map((s: { image_url: string | null }) => s.image_url)
          .filter((u): u is string => !!u)
          // The public URL ends in `/storage/v1/object/public/cigar-images/{path}`;
          // strip everything up to and including the bucket name to get the path.
          .map((u) => {
            const marker = "/cigar-images/";
            const idx = u.indexOf(marker);
            return idx >= 0 ? u.slice(idx + marker.length) : null;
          })
          .filter((p): p is string => !!p);
      }
    } catch {
      // Non-fatal — proceed with row deletion even if path extraction fails.
    }

    // 2b. Delete user-owned rows. Best-effort — if any single delete fails we still
    // attempt the others so we don't leave the account in a half-deleted state.
    // Apple Guideline 5.1.1(v) requires complete removal of personal data on
    // user-initiated account deletion. Two of these tables (cigar_submissions
    // and cigar_image_submissions) have ON DELETE SET NULL on profiles(id),
    // which would orphan rows instead of removing them — so we delete explicitly.
    const tables = [
      "humidor_items",
      "journal_entries",
      "scan_images",
      "quiz_results",
      "cigar_reviews",
      "cigar_submissions",
      "cigar_image_submissions",
    ];
    await Promise.all(
      tables.map((t) =>
        admin.from(t).delete().eq("user_id", userId).then(
          () => null,
          () => null,
        )
      ),
    );
    await admin.from("profiles").delete().eq("id", userId).then(
      () => null,
      () => null,
    );

    // 3. Best-effort: clear user's storage objects.
    // - cigar-images, scan-uploads, journal-photos: legacy {userId}/* layout
    //   used by avatar/scan/journal uploads. List + delete that prefix.
    // - cigar-images additionally holds community submissions at
    //   {cigarId}/{userId}/* — those paths come from submissionPaths above.
    const buckets = ["cigar-images", "scan-uploads", "journal-photos"];
    for (const bucket of buckets) {
      try {
        const { data: files } = await admin.storage
          .from(bucket)
          .list(userId, { limit: 1000 });
        if (files && files.length > 0) {
          await admin.storage
            .from(bucket)
            .remove(files.map((f) => `${userId}/${f.name}`));
        }
      } catch {
        // Ignore — storage may not have any files for this user.
      }
    }
    if (submissionPaths.length > 0) {
      try {
        await admin.storage.from("cigar-images").remove(submissionPaths);
      } catch {
        // Ignore — submission rows are already gone; storage cleanup is best-effort.
      }
    }

    // 4. Finally delete the auth.users row. This invalidates all refresh tokens.
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("auth.admin.deleteUser failed:", deleteError);
      return new Response(
        JSON.stringify({ error: "Account deletion failed. Please contact support." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("delete-account error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
