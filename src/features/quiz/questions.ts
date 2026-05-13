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

// ── BASIC QUIZ (Free) — 3 questions, 30 seconds ─────────────────────────────
//
// Build 17 reframe (post-1.4.3 rejection of Build 16): questions are written
// as collection-building prompts, not consumption-preference prompts. The app
// is positioned as a hobby app for cigar collectors — Vivino for wine
// cellars, Reverb for guitars, this for humidors. Every question asks "what
// belongs in your collection," never "what should you smoke."

export const BASIC_QUESTIONS: QuizQuestion[] = [
  {
    key: 'strength',
    title: 'What strength range belongs in your humidor?',
    subtitle: 'From mild everyday picks to full-power statement cigars',
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
    subtitle: "Pick up to 3 — we'll find cigars to add to your humidor",
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
    subtitle: 'From everyday cigars to top-shelf collectibles',
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
];

// ── ADVANCED QUIZ (Pro) — additional questions after the basic 3 ─────────────
//
// Build 17: the legacy `time` question ("Typical occasion?") was the only
// remaining smoking-adjacent prompt. Replaced with `collector_style`, which
// asks what kind of humidor the user is building. Maps cleanly onto popularity
// and price tiers in scoring without leaking consumption language.

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
    key: 'wrapper',
    title: 'Wrapper preference?',
    subtitle: 'The outer leaf shapes the whole experience',
    type: 'choice',
    tier: 'advanced',
    options: [
      { label: 'Connecticut (mild, creamy)', value: 'connecticut' },
      { label: 'Habano (spicy, complex)', value: 'habano' },
      { label: 'Maduro (dark, sweet)', value: 'maduro' },
      { label: 'No Preference', value: 'any' },
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
    key: 'adventure',
    title: 'How adventurous are you?',
    subtitle: 'Limit results to classics or open them up?',
    type: 'choice',
    tier: 'advanced',
    options: [
      { label: 'Stick to Classics', value: 'classic' },
      { label: 'Open to Suggestions', value: 'middle' },
      { label: 'Surprise Me', value: 'surprise' },
    ],
  },
];

/** All questions in order (basic first, then advanced) */
export const ALL_QUESTIONS: QuizQuestion[] = [...BASIC_QUESTIONS, ...ADVANCED_QUESTIONS];

/** Legacy export for backward compatibility */
export const QUESTIONS = ALL_QUESTIONS;
