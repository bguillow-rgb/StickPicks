import type { Cigar, QuizAnswers } from '@/src/types/cigar';

interface ScoredCigar {
  cigar: Cigar;
  score: number;
  reasons: string[];
}

/**
 * Maps user-facing flavor labels to the actual flavor strings stored in the DB.
 * A quiz selection of "Chocolate" should match cigars with cocoa, dark chocolate, etc.
 */
const FLAVOR_GROUPS: Record<string, string[]> = {
  cedar: ['cedar', 'oak'],
  leather: ['leather'],
  pepper: ['pepper', 'black pepper', 'red pepper', 'white pepper'],
  chocolate: ['chocolate', 'cocoa', 'dark chocolate', 'milk chocolate', 'mocha'],
  coffee: ['coffee', 'espresso', 'mocha'],
  cream: ['cream', 'vanilla', 'milk chocolate'],
  nuts: ['nuts', 'almonds', 'almond'],
  earth: ['earth', 'charcoal', 'smoke', 'smoky', 'mesquite'],
  fruit: ['fruit', 'cherry', 'plum', 'citrus', 'dried fruit'],
  spice: ['spice', 'sweet spice', 'baking spice', 'black pepper', 'red pepper'],
  honey: ['honey', 'caramel', 'molasses', 'sweet'],
  vanilla: ['vanilla', 'cream', 'sweet'],
  toast: ['toast', 'hay', 'oak'],
};

function flavorOverlap(userFlavors: string[], cigarFlavors: string[]): { hits: number; matched: string[] } {
  const cigarSet = new Set(cigarFlavors.map((f) => f.toLowerCase()));
  let hits = 0;
  const matched: string[] = [];

  for (const userFlavor of userFlavors) {
    const group = FLAVOR_GROUPS[userFlavor.toLowerCase()];
    if (!group) {
      // Direct match fallback
      if (cigarSet.has(userFlavor.toLowerCase())) {
        hits++;
        matched.push(userFlavor);
      }
      continue;
    }
    // Check if any term in the group matches any cigar flavor
    if (group.some((term) => cigarSet.has(term))) {
      hits++;
      matched.push(userFlavor);
    }
  }

  return { hits, matched };
}

export function scoreQuiz(answers: QuizAnswers, cigars: Cigar[]): ScoredCigar[] {
  if (!cigars.length) return [];

  const scored = cigars.map((cigar) => {
    let score = 0;
    const reasons: string[] = [];
    const cigarFlavors = cigar.flavors ?? [];

    // Strength match (30% weight, max 30 points)
    if (answers.strength != null && cigar.strength) {
      const diff = Math.abs(answers.strength - cigar.strength);
      const pts = (1 - diff / 4) * 30;
      score += pts;
      if (diff === 0) reasons.push('Strength matches perfectly');
      else if (diff === 1) reasons.push('Strength is a close match');
    }

    // Flavor overlap (40% weight, max 40 points)
    if (answers.flavors.length > 0 && cigarFlavors.length > 0) {
      const { hits, matched } = flavorOverlap(answers.flavors, cigarFlavors);
      const pct = hits / answers.flavors.length;
      score += pct * 40;
      if (matched.length > 0) {
        reasons.push(`Flavor match: ${matched.join(', ')}`);
      }
    }

    // Price match (20% weight, max 20 points)
    if (answers.price != null && cigar.price_tier) {
      const diff = Math.abs(answers.price - cigar.price_tier);
      const pts = (1 - diff / 4) * 20;
      score += pts;
      if (diff === 0) reasons.push('Price tier matches exactly');
      else if (diff === 1) reasons.push('Price is in range');
    }

    // Body match (bonus for advanced quiz, max 10 points)
    if (answers.body != null && cigar.body) {
      const diff = Math.abs(answers.body - cigar.body);
      score += (1 - diff / 4) * 10;
      if (diff <= 1) reasons.push('Body is a close match');
    }

    // Smoothness (bonus for advanced quiz)
    if (answers.smoothness) {
      const hasCreamy = cigarFlavors.some((f) =>
        ['cream', 'vanilla', 'honey', 'sweet', 'milk chocolate'].includes(f.toLowerCase())
      );
      const hasSpice = cigarFlavors.some((f) =>
        ['pepper', 'black pepper', 'red pepper', 'spice', 'earth', 'leather'].includes(f.toLowerCase())
      );

      if (answers.smoothness === 'ultra-smooth') {
        score += hasCreamy ? 5 : hasSpice ? 1 : 3;
      } else if (answers.smoothness === 'punchy') {
        score += hasSpice ? 5 : hasCreamy ? 1 : 3;
      } else {
        score += 3;
      }
    }

    // Collector style adjustment (Build 17 — replaces legacy `time` axis).
    // Different collectors want different humidors; we bias the recommendation
    // mix using popularity_tier (1=deep cut, 5=iconic) and price_tier.
    //
    //   starter      → favors recognized names at accessible prices, so a
    //                  first-time collector ends up with a humidor full of
    //                  cigars they can actually find at any local shop.
    //   variety      → no bias (broad humidor).
    //   specialist   → amplifies the wrapper/origin match the user already
    //                  picked (handled below in the wrapper/origin blocks).
    //   connoisseur  → favors deep cuts at premium prices, biased toward
    //                  rarer collection-worthy entries.
    if (answers.collector_style) {
      const pop = cigar.popularity_tier ?? 3;
      const price = cigar.price_tier ?? 3;

      if (answers.collector_style === 'starter') {
        if (pop >= 4) score += 2;
        if (price <= 2) score += 2;
        if (pop >= 4 && price <= 3) reasons.push('Accessible starter pick');
      } else if (answers.collector_style === 'connoisseur') {
        if (pop <= 2) score += 2;
        if (price >= 4) score += 2;
        if (pop <= 2 && price >= 4) reasons.push('Rare connoisseur pick');
      }
      // 'variety' and 'specialist' get no popularity/price bias here —
      // specialist's amplification lives in the wrapper/origin blocks.
    }

    // Specialist collectors care more than anyone about wrapper/origin
    // fidelity — they're building a focused collection around one style.
    // Apply a multiplier to the wrapper and origin bonuses below.
    const specialistMult = answers.collector_style === 'specialist' ? 2 : 1;

    // Wrapper preference (bonus for advanced quiz, max 5 points base)
    if (answers.wrapper && answers.wrapper !== 'any' && cigar.wrapper) {
      const w = cigar.wrapper.toLowerCase();
      if (answers.wrapper === 'connecticut' && w.includes('connecticut')) {
        score += 5 * specialistMult;
        reasons.push('Connecticut wrapper match');
      } else if (answers.wrapper === 'habano' && (w.includes('habano') || w.includes('corojo'))) {
        score += 5 * specialistMult;
        reasons.push('Habano wrapper match');
      } else if (answers.wrapper === 'maduro' && (w.includes('maduro') || w.includes('oscuro') || w.includes('broadleaf'))) {
        score += 5 * specialistMult;
        reasons.push('Maduro wrapper match');
      }
    }

    // Origin preference (bonus for advanced quiz, max 5 points base)
    if (answers.origin && answers.origin !== 'any' && cigar.origin) {
      if (cigar.origin.toLowerCase() === answers.origin.toLowerCase()) {
        score += 5 * specialistMult;
        reasons.push(`Made in ${cigar.origin}`);
      }
    }

    // Vitola preference (Build 19 — small ±2 boost when format matches).
    // Match against cigar.vitola (which is sometimes null on unenriched
    // rows). Substring match because vitola fields in the catalog include
    // qualifiers ("Robusto Gordo", "Toro Grande"). Skip entirely on 'any'
    // or when cigar.vitola is null — never punishes unenriched rows.
    if (answers.vitola && answers.vitola !== 'any' && cigar.vitola) {
      const v = cigar.vitola.toLowerCase();
      if (v.includes(answers.vitola.toLowerCase())) {
        score += 2;
        // Title-case the user's choice for the reason line ("Robusto",
        // "Toro" etc. — never the raw lowercase enum value).
        const label = answers.vitola.charAt(0).toUpperCase() + answers.vitola.slice(1);
        reasons.push(`${label} vitola match`);
      }
    }

    return { cigar, score, reasons };
  });

  // Adventure-level reranking. Uses popularity_tier (1=deep cut, 5=iconic)
  // to bias which cigars float to the top after the quality-match scoring.
  // This is where "Stick to Classics", "Open to Suggestions", and "Surprise
  // Me" become meaningfully different result sets.
  //
  // classic   → heavily favor high popularity (known names the user can find)
  // middle    → no bias, quality match only
  // surprise  → invert popularity, BUT enforce a quality floor so we never
  //             recommend a poor-match cigar just because it's obscure
  const adventure = answers.adventure;
  const QUALITY_FLOOR_FOR_SURPRISE = 40;   // out of ~110 max raw score
  const POPULARITY_WEIGHT = 8;              // per-tier bump/hit; ±16 total across the 5-tier range

  const adjusted = scored
    .map(({ cigar, score, reasons }) => {
      // Null popularity → treat as tier 3 (neutral). Never punishes a cigar
      // for missing enrichment data; just means no adventure-mode influence.
      const pop = cigar.popularity_tier ?? 3;

      let finalScore = score;
      const finalReasons = [...reasons];

      if (adventure === 'classic') {
        // +16 for iconic (pop=5), -16 for deep cut (pop=1)
        finalScore += (pop - 3) * POPULARITY_WEIGHT;
        if (pop >= 4) finalReasons.push('A recognized classic');
      } else if (adventure === 'surprise') {
        // Surprise mode: only surface cigars that still match reasonably
        // well. Below the quality floor, drop them entirely — a "surprise"
        // that doesn't match the palate destroys trust.
        if (score < QUALITY_FLOOR_FOR_SURPRISE) return null;
        finalScore += (3 - pop) * POPULARITY_WEIGHT;
        if (pop <= 2) finalReasons.push('Off the beaten path');
      }
      // 'middle' and undefined: no adjustment

      return { cigar, score: finalScore, reasons: finalReasons };
    })
    .filter((x): x is ScoredCigar => x !== null);

  return adjusted.sort((a, b) => b.score - a.score).slice(0, 10);
}
