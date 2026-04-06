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
}

export const QUESTIONS: QuizQuestion[] = [
  {
    key: 'strength',
    title: 'How strong do you want it?',
    subtitle: 'Pick the strength that fits your mood',
    type: 'scale',
    options: [
      { label: 'Mild', value: 1 },
      { label: 'Mild-Medium', value: 2 },
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
    options: [
      { label: 'Smooth & Creamy', value: 'ultra-smooth' },
      { label: 'Balanced', value: 'balanced' },
      { label: 'Bold & Robust', value: 'punchy' },
    ],
  },
  {
    key: 'body',
    title: 'What body do you prefer?',
    subtitle: 'The weight and thickness of the smoke',
    type: 'scale',
    options: [
      { label: 'Light', value: 1 },
      { label: 'Light-Medium', value: 2 },
      { label: 'Medium', value: 3 },
      { label: 'Medium-Full', value: 4 },
      { label: 'Full', value: 5 },
    ],
  },
  {
    key: 'time',
    title: 'When are you smoking?',
    subtitle: 'Time of day matters more than you think',
    type: 'choice',
    options: [
      { label: 'Morning / Coffee', value: 'morning' },
      { label: 'Afternoon', value: 'midday' },
      { label: 'Evening', value: 'evening' },
      { label: 'Late Night', value: 'late' },
    ],
  },
  {
    key: 'price',
    title: "What's your budget?",
    subtitle: 'From everyday to special occasion',
    type: 'scale',
    options: [
      { label: 'Value', value: 1 },
      { label: 'Affordable', value: 2 },
      { label: 'Mid-Range', value: 3 },
      { label: 'Premium', value: 4 },
      { label: 'Top-Shelf', value: 5 },
    ],
  },
  {
    key: 'flavors',
    title: 'Pick flavors you enjoy',
    subtitle: 'Select up to 3 — this heavily influences your match',
    type: 'multi',
    max: 3,
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
    key: 'adventure',
    title: 'How adventurous are you?',
    subtitle: 'Stick to classics or try something new?',
    type: 'choice',
    options: [
      { label: 'Stick to Classics', value: 'classic' },
      { label: 'Open to Suggestions', value: 'middle' },
      { label: 'Surprise Me', value: 'surprise' },
    ],
  },
];
