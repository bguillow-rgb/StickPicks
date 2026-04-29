// Counts scans against the durable device id so the quota follows the user
// across Guest → signup → Guest again, not per-user (which would reset on
// every anonymous sign-in).
//
// Policy:
//   TOTAL_SCAN_LIMIT    — absolute cap for any caller on this device.
//   GUEST_SCAN_LIMIT    — anonymous users block here; must sign in to go further.

import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { getDeviceId } from '@/lib/deviceId';
import { useProStore } from '@/src/stores/useProStore';

export const TOTAL_SCAN_LIMIT = 10;
export const GUEST_SCAN_LIMIT = 5;

interface ScanCountState {
  count: number | null;
  isAnonymous: boolean | null;
  limit: number;
  remaining: number | null;
  limitReached: boolean;
  guestLimitReached: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useScanCount(): ScanCountState {
  const [count, setCount] = useState<number | null>(null);
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // Pro entitlement is the override — Pro users have unlimited identifications.
  // Treat as Pro until hydration completes so we never show the gate during the
  // AsyncStorage rehydrate window on cold start.
  const isPro = useProStore((s) => s.isPro);
  const hasHydrated = useProStore((s) => s.hasHydrated);
  const treatAsPro = !hasHydrated || isPro;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const deviceId = await getDeviceId();
      const { data: { user } } = await supabase.auth.getUser();
      const anonymous = user?.app_metadata?.provider === 'anonymous' || !!user?.is_anonymous;
      setIsAnonymous(!!anonymous);

      const { count: c } = await supabase
        .from('scan_images')
        .select('id', { count: 'exact', head: true })
        .eq('device_id', deviceId);
      setCount(c ?? 0);
    } catch {
      // Keep previous count on failure; don't wipe state mid-session.
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => { refresh(); });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  const effectiveLimit = isAnonymous ? GUEST_SCAN_LIMIT : TOTAL_SCAN_LIMIT;
  // Pro users bypass both gates entirely. Free users still hit the
  // TOTAL_SCAN_LIMIT cap; anonymous guests hit the GUEST_SCAN_LIMIT cap first.
  const guestLimitReached =
    !treatAsPro &&
    isAnonymous === true && count !== null && count >= GUEST_SCAN_LIMIT;
  const limitReached =
    !treatAsPro && count !== null && count >= TOTAL_SCAN_LIMIT;

  return {
    count,
    isAnonymous,
    limit: effectiveLimit,
    // remaining is only meaningful for free users; Pro users never see it
    // because the home screen already gates the "X free remaining" copy on
    // !treatAsPro. Returning the raw math is fine — it just won't be rendered.
    remaining: count !== null ? Math.max(0, effectiveLimit - count) : null,
    limitReached,
    guestLimitReached,
    loading,
    refresh,
  };
}
