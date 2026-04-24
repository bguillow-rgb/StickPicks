// Thin client for the `public.tick_streak` RPC + a table-read helper.
//
// The RPC is SECURITY DEFINER (migration 015) so direct writes to
// `user_streaks` are blocked — every increment has to route through here.
//
// Responsibilities of this file:
//   1. Normalize the device timezone into an IANA string.
//   2. Call the RPC and return a typed row.
//   3. Pull all streaks for a user (cache hydration on boot + sign-in).
//
// This file intentionally has NO side effects beyond the DB call. The
// companion hook `useStreakToast` owns toast + cache-update logic so that
// telemetry + UI concerns stay separate from the RPC surface.

import { supabase } from '@/lib/supabase';

export type StreakType = 'engagement' | 'scan' | 'quiz';

export interface StreakState {
  streak_type: StreakType;
  current_streak: number;
  best_streak: number;
  last_activity_date: string | null; // 'YYYY-MM-DD' in user's local TZ
}

export interface StreakTickResult extends StreakState {
  did_increment: boolean;
}

// Resolve the user's IANA timezone string. Falls back to UTC if the JS
// runtime doesn't expose Intl.DateTimeFormat (rare but defensible).
function deviceTz(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz && tz.length > 0 ? tz : 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Tick the streak of the given type for the authenticated user. Returns
 * the new server state plus whether this call actually incremented.
 * Returns null if the RPC failed (network, auth expiry, etc.) — callers
 * should treat a null return as "keep cache as-is, try again later."
 */
export async function tickStreak(type: StreakType): Promise<StreakTickResult | null> {
  const { data, error } = await supabase.rpc('tick_streak', {
    p_type: type,
    p_tz: deviceTz(),
  });

  if (error) {
    // Never throw — streaks are a side-feature, they must not break the
    // calling flow (scan confirm, app foreground, etc.). Log to console
    // in dev; the real signal is the absence of STREAK_TICKED telemetry.
    if (__DEV__) console.warn('[streaks] tick failed', type, error.message);
    return null;
  }

  // Supabase RPCs that RETURN TABLE come back as an array of rows.
  if (!Array.isArray(data) || data.length === 0) return null;

  const row = data[0] as {
    streak_type: StreakType;
    current_streak: number;
    best_streak: number;
    did_increment: boolean;
    last_activity_date: string | null;
  };

  return {
    streak_type: row.streak_type,
    current_streak: row.current_streak,
    best_streak: row.best_streak,
    last_activity_date: row.last_activity_date,
    did_increment: row.did_increment,
  };
}

/**
 * Pull all streak rows for the authenticated user in one query. Called
 * from `_layout.tsx` on sign-in and on AppState 'active' transitions so
 * the profile surface hydrates without waiting for the next tick.
 *
 * Requires the user to be signed in; returns [] for guests.
 */
export async function pullAllStreaks(userId: string): Promise<StreakState[]> {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('user_streaks')
    .select('streak_type, current_streak, best_streak, last_activity_date')
    .eq('user_id', userId);

  if (error || !data) return [];
  return data as StreakState[];
}
