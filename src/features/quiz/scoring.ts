import type { Cigar, QuizAnswers } from '@/src/types/cigar';

interface ScoredCigar {
  cigar: Cigar;
  score: number;
  reasons: string[];
}

export function scoreQuiz(answers: QuizAnswers, cigars: Cigar[]): ScoredCigar[] {
  if (!cigars.length) return [];

  const scored = cigars.map((cigar) => {
    let score = 0;
    const reasons: string[] = [];
    const cigarFlavors = cigar.flavors ?? [];

    // Strength match (25% weight, max 25 points)
    if (answers.strength != null && cigar.strength) {
      const diff = Math.abs(answers.strength - cigar.strength);
      const pts = (1 - diff / 4) * 25;
      score += pts;
      if (diff <= 1) reasons.push(`Strength is a close match`);
    }

    // Flavor overlap (30% weight, max 30 points)
    if (answers.flavors.length > 0 && cigarFlavors.length > 0) {
      const flavorSet = new Set(cigarFlavors.map((f) => f.toLowerCase()));
      const hits = answers.flavors.filter((f) => flavorSet.has(f.toLowerCase())).length;
      const pct = hits / answers.flavors.length;
      score += pct * 30;
      if (hits > 0) {
        const matched = answers.flavors.filter((f) => flavorSet.has(f.toLowerCase()));
        reasons.push(`Flavor match: ${matched.join(', ')}`);
      }
    }

    // Body match (20% weight, max 20 points)
    if (answers.body != null && cigar.body) {
      const diff = Math.abs(answers.body - cigar.body);
      score += (1 - diff / 4) * 20;
      if (diff <= 1) reasons.push(`Body is a close match`);
    }

    // Price match (15% weight, max 15 points)
    if (answers.price != null && cigar.price_tier) {
      const diff = Math.abs(answers.price - cigar.price_tier);
      score += (1 - diff / 4) * 15;
      if (diff === 0) reasons.push(`Price tier matches exactly`);
    }

    // Smoothness (10% weight, max 10 points)
    if (answers.smoothness) {
      const hasCreamy = cigarFlavors.some((f) =>
        ['cream', 'vanilla', 'honey', 'sweet'].includes(f.toLowerCase())
      );
      const hasSpice = cigarFlavors.some((f) =>
        ['pepper', 'spice', 'earth', 'leather'].includes(f.toLowerCase())
      );

      if (answers.smoothness === 'ultra-smooth') {
        score += hasCreamy ? 10 : hasSpice ? 2 : 5;
      } else if (answers.smoothness === 'punchy') {
        score += hasSpice ? 10 : hasCreamy ? 2 : 5;
      } else {
        score += 6; // balanced gets a moderate boost regardless
      }
    }

    // Time of day adjustment (bonus)
    if (answers.time) {
      const isMild = (cigar.strength ?? 3) <= 2;
      const isFull = (cigar.strength ?? 3) >= 4;

      if (answers.time === 'morning' && isMild) score += 3;
      if (answers.time === 'late' && isFull) score += 3;
      if (answers.time === 'evening' && isFull) score += 2;
    }

    // Adventure level adjustment (bonus)
    if (answers.adventure === 'surprise') {
      // Slight randomization to surface unexpected picks
      score += Math.random() * 5;
    }

    return { cigar, score, reasons };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 10);
}
