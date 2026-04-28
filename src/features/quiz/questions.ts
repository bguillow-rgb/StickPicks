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

export const BASIC_QUESTIONS: QuizQuestion[] = [
  {
    key: 'strength',
    title: 'How strong do you like it?',
    subtitle: 'From light and easy to full power',
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
    title: 'Select flavor preferences',
    subtitle: 'Pick up to 3 — this drives your catalog match',
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
    title: "What's your budget?",
    subtitle: 'From everyday cigars to special occasions',
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

export const ADVANCED_QUESTIONS: QuizQuestion[] = [
  {
    key: 'body',
    title: 'What body do you prefer?',
    subtitle: 'The weight and richness in the catalog profile',
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
    title: "What's your smoothness preference?",
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
    key: 'time',
    title: 'Typical occasion?',
    subtitle: 'Different catalog profiles suit different times of day',
    type: 'choice',
    tier: 'advanced',
    options: [
      { label: 'Morning / Coffee', value: 'morning' },
      { label: 'Afternoon', value: 'midday' },
      { label: 'Evening', value: 'evening' },
      { label: 'Late Night', value: 'late' },
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
