import { File, Paths } from 'expo-file-system/next';
import { supabase } from '@/lib/supabase';
import type { Cigar } from '@/src/types/cigar';

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

interface IdentifyResult {
  cigar: Cigar | null;
  confidence: number;
  reasoning: string;
  rawResponse: Record<string, unknown>;
}

const IDENTIFY_PROMPT = `You are a cigar identification expert. Analyze this image and identify the cigar.

Look at the cigar band, wrapper color, size, and any visible text or logos.

Respond ONLY with valid JSON in this exact format:
{
  "brand": "the brand name",
  "name": "the specific cigar line/name",
  "vitola": "the size/shape if identifiable",
  "confidence": 0.85,
  "reasoning": "Brief explanation of how you identified it"
}

If you cannot identify the cigar, respond with:
{
  "brand": null,
  "name": null,
  "vitola": null,
  "confidence": 0,
  "reasoning": "Explanation of why identification failed"
}`;

async function readFileAsBase64(uri: string): Promise<string> {
  try {
    const file = new File(uri);
    const base64 = await file.base64();
    return base64;
  } catch {
    // Fallback: fetch as blob and convert
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl.split(',')[1] || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export async function identifyCigar(imageUri: string): Promise<IdentifyResult> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured. Set EXPO_PUBLIC_ANTHROPIC_API_KEY in .env.local');
  }

  // Read image as base64
  const base64 = await readFileAsBase64(imageUri);

  // Determine media type
  const ext = imageUri.split('.').pop()?.toLowerCase();
  const mediaType = ext === 'png' ? 'image/png' : 'image/jpeg';

  // Call Claude Vision API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
              text: IDENTIFY_PROMPT,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }

  const apiResult = await response.json();
  const textContent = apiResult.content?.find((c: any) => c.type === 'text')?.text ?? '{}';

  let parsed: any;
  try {
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : textContent);
  } catch {
    parsed = { brand: null, name: null, confidence: 0, reasoning: 'Failed to parse response' };
  }

  // Try to match against our database
  let matchedCigar: Cigar | null = null;

  if (parsed.brand && parsed.name) {
    const { data } = await supabase
      .from('cigars')
      .select('*')
      .ilike('brand', `%${parsed.brand}%`)
      .ilike('name', `%${parsed.name}%`)
      .limit(1);

    if (data && data.length > 0) {
      matchedCigar = data[0] as Cigar;
    } else {
      const { data: brandData } = await supabase
        .from('cigars')
        .select('*')
        .ilike('brand', `%${parsed.brand}%`)
        .limit(1);

      if (brandData && brandData.length > 0) {
        matchedCigar = brandData[0] as Cigar;
      }
    }
  }

  // Save scan to database for training
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const filePath = user ? `${user.id}/${fileName}` : `anonymous/${fileName}`;

    const imageResponse = await fetch(imageUri);
    const imageBlob = await imageResponse.blob();

    await supabase.storage
      .from('scan-uploads')
      .upload(filePath, imageBlob, { contentType: mediaType });

    const { data: urlData } = supabase.storage
      .from('scan-uploads')
      .getPublicUrl(filePath);

    await supabase.from('scan_images').insert({
      user_id: user?.id ?? null,
      image_url: urlData.publicUrl,
      identified_cigar_id: matchedCigar?.id ?? null,
      confidence: parsed.confidence ?? null,
      user_confirmed: false,
      raw_llm_response: apiResult,
    });
  } catch {
    console.warn('Failed to save scan data');
  }

  return {
    cigar: matchedCigar,
    confidence: parsed.confidence ?? 0,
    reasoning: parsed.reasoning ?? '',
    rawResponse: apiResult,
  };
}
