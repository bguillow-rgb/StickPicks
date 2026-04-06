export interface Cigar {
  id: string;
  brand: string;
  name: string;
  vitola: string | null;
  strength: number; // 1-5
  body: number; // 1-5
  price_tier: number; // 1-5
  wrapper: string | null;
  binder: string | null;
  filler: string[];
  origin: string | null;
  flavors: string[];
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface HumidorItem {
  id: string;
  user_id: string;
  cigar_id: string;
  status: 'wishlist' | 'owned' | 'smoked';
  notes: string | null;
  created_at: string;
  updated_at: string;
  cigar?: Cigar;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  cigar_id: string;
  rating: number; // 1-5
  notes: string | null;
  photo_url: string | null;
  smoked_at: string;
  created_at: string;
  cigar?: Cigar;
}

export interface ScanImage {
  id: string;
  user_id: string | null;
  image_url: string;
  identified_cigar_id: string | null;
  confidence: number | null;
  user_confirmed: boolean;
  corrected_cigar_id: string | null;
  raw_llm_response: Record<string, unknown> | null;
  created_at: string;
}

export interface QuizAnswers {
  strength: number | null;
  smoothness: string | null;
  body: number | null;
  time: string | null;
  price: number | null;
  flavors: string[];
  adventure: string | null;
}

export interface QuizResult {
  id: string;
  user_id: string | null;
  answers: QuizAnswers;
  top_match_id: string | null;
  all_matches: { cigar_id: string; score: number; reasons: string[] }[];
  created_at: string;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  taste_profile: QuizAnswers | null;
  created_at: string;
  updated_at: string;
}
