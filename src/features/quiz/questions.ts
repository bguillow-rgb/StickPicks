export interface QuizOption {
  label: string;
  value: string | number;
}

export interface QuizQuestion {
  key: string;
  title: string;
  subtitle: string;
  type: 'scale' | 'choice' | 'multi';
  max?: number;
  options: QuizOption[];
  tier: 'basic' | 'advanced';
}

// ── BASIC QUIZ (Free) — 5 questions ──────────────────────────────────────────
//
// Pour Picks pattern (commit c433f8b, 2026-05-12): basic = first 5 of a 10-
// question deck; advanced = the full 10. Both tiers fill the same scoring
// shape, advanced just gets more axes. Stick Picks port: promoted Wrapper +
// Adventure from advanced to basic — both are vocab-light, no consumption
// verbs, and reshape ranking meaningfully (wrapper is a hard filter signal,
// adventure controls classics-vs-deep-cut bias).

export const BASIC_QUESTIONS: QuizQuestion[] = [
  {
    key: 'strength',
    title: 'What strength range belongs in your humidor?',
    subtitle: 'From mild everyday picks to full-power statement profiles',
    type: 'scale',
    tier: 'basic',
    options: [
      { label: 'Mild', value: 1 },
      { label: 'Mild-Medium', value: 2 },
      { label: 'Medium', value: 3 },
      { label: 'Medium-Full', value: 4 },
      { label: 'Full', value: 5 },
    ],
  },
  {
    key: 'flavors',
    title: 'Which flavor profiles do you want in your collection?',
    subtitle: "Pick up to 3 — we'll find matches to add to your humidor",
    type: 'multi',
    max: 3,
    tier: 'basic',
    options: [
      { label: 'Cedar', value: 'cedar' },
      { label: 'Leather', value: 'leather' },
      { label: 'Pepper', value: 'pepper' },
      { label: 'Chocolate', value: 'chocolate' },
      { label: 'Coffee', value: 'coffee' },
      { label: 'Cream', value: 'cream' },
      { label: 'Nuts', value: 'nuts' },
      { label: 'Earth', value: 'earth' },
      { label: 'Fruit', value: 'fruit' },
      { label: 'Spice', value: 'spice' },
      { label: 'Honey', value: 'honey' },
      { label: 'Vanilla', value: 'vanilla' },
    ],
  },
  {
    key: 'price',
    title: 'What price tier are you collecting at?',
    subtitle: 'From everyday picks to top-shelf collectibles',
    type: 'scale',
    tier: 'basic',
    options: [
      { label: 'Value', value: 1 },
      { label: 'Affordable', value: 2 },
      { label: 'Mid-Range', value: 3 },
      { label: 'Premium', value: 4 },
      { label: 'Top-Shelf', value: 5 },
    ],
  },
  {
    key: 'wrapper',
    title: 'Wrapper preference?',
    subtitle: 'The outer leaf shapes the whole experience',
    type: 'choice',
    tier: 'basic',
    options: [
      { label: 'Connecticut (mild, creamy)', value: 'connecticut' },
      { label: 'Habano (spicy, complex)', value: 'habano' },
      { label: 'Maduro (dark, sweet)', value: 'maduro' },
      { label: 'No Preference', value: 'any' },
    ],
  },
  {
    key: 'adventure',
    title: 'How adventurous are you?',
    subtitle: 'Limit results to classics or open them up?',
    type: 'choice',
    tier: 'basic',
    options: [
      { label: 'Stick to Classics', value: 'classic' },
      { label: 'Open to Suggestions', value: 'middle' },
      { label: 'Surprise Me', value: 'surprise' },
    ],
  },
];

// ── ADVANCED QUIZ (Pro) — additional 5 questions after the basic 5 ───────────
//
// Build 19: vitola added as the 10th question to round out the deck. Real
// signal — different vitolas suit different occasions in a collection (a
// connoisseur might want a mix of formats, a starter might want robusto-
// only). Scoring boost is small (±2) to keep flavor/strength the dominant
// signals.

export const ADVANCED_QUESTIONS: QuizQuestion[] = [
  {
    key: 'body',
    title: 'What body range should your humidor cover?',
    subtitle: 'The weight profile your collection should span',
    type: 'scale',
    tier: 'advanced',
    options: [
      { label: 'Light', value: 1 },
      { label: 'Light-Medium', value: 2 },
      { label: 'Medium', value: 3 },
      { label: 'Medium-Full', value: 4 },
      { label: 'Full', value: 5 },
    ],
  },
  {
    key: 'smoothness',
    title: 'What smoothness profile do you collect?',
    subtitle: 'Smooth and creamy or bold and robust?',
    type: 'choice',
    tier: 'advanced',
    options: [
      { label: 'Smooth & Creamy', value: 'ultra-smooth' },
      { label: 'Balanced', value: 'balanced' },
      { label: 'Bold & Robust', value: 'punchy' },
    ],
  },
  {
    key: 'origin',
    title: 'Origin preference?',
    subtitle: 'Where the tobacco is grown matters',
    type: 'choice',
    tier: 'advanced',
    options: [
      { label: 'Nicaragua', value: 'Nicaragua' },
      { label: 'Dominican Republic', value: 'Dominican Republic' },
      { label: 'Honduras', value: 'Honduras' },
      { label: 'No Preference', value: 'any' },
    ],
  },
  {
    key: 'collector_style',
    title: 'What kind of collector are you?',
    subtitle: 'Different collectors want different humidors',
    type: 'choice',
    tier: 'advanced',
    options: [
      { label: 'Starter (focused selection)', value: 'starter' },
      { label: 'Variety Builder (broad range)', value: 'variety' },
      { label: 'Specialist (one origin or style)', value: 'specialist' },
      { label: 'Connoisseur (rare and aged)', value: 'connoisseur' },
    ],
  },
  {
    key: 'vitola',
    title: 'Vitola preference?',
    subtitle: 'The size and shape that fits your collection',
    type: 'choice',
    tier: 'advanced',
    options: [
      { label: 'Robusto (compact, balanced)', value: 'robusto' },
      { label: 'Toro (longer, steady burn)', value: 'toro' },
      { label: 'Torpedo (tapered, focused)', value: 'torpedo' },
      { label: 'Churchill (long, formal)', value: 'churchill' },
      { label: 'No Preference', value: 'any' },
    ],
  },
];

/** All questions in order (basic first, then advanced) */
export const ALL_QUESTIONS: QuizQuestion[] = [...BASIC_QUESTIONS, ...ADVANCED_QUESTIONS];

/** Legacy export for backward compatibility */
export const QUESTIONS = ALL_QUESTIONS;
