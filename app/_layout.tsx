import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, LogBox, AppState, Image, type AppStateStatus } from 'react-native';

// RevenueCat can't fetch offerings until the products are live in App Store
// Connect, which only happens for release builds. In dev, the expected failure
// surfaces as a red LogBox toast that obscures the UI we're trying to test —
// silence it here.
if (__DEV__) {
  LogBox.ignoreLogs([
    /\[RevenueCat\]/,
    /Error fetching offerings/,
  ]);
}
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import 'react-native-reanimated';
import { COLORS } from '@/src/constants/theme';
import { StyledAlertHost } from '@/src/components/ui/StyledAlert';
import { ToastHost } from '@/src/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { initRevenueCat, identifyUser, getCustomerInfo, isProActive } from '@/src/lib/revenuecat';
import { loadBrandLogos } from '@/src/lib/brandLogos';
import { pullAllStreaks } from '@/src/features/streaks/streaksService';
import { recordActivity } from '@/src/features/streaks/useStreakToast';
import { useStreakStore } from '@/src/stores/useStreakStore';
import { useProStore } from '@/src/stores/useProStore';
import { useAgeGateStore, useHydrateAgeGate } from '@/src/stores/useAgeGateStore';
import {
  initAnalytics,
  initErrorReporting,
  identify as identifyAnalytics,
  resetAnalytics,
  setErrorUser,
  captureSilent,
} from '@/src/lib/observability';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const StickPicksDark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.accent,
    background: COLORS.bg,
    card: COLORS.card,
    text: COLORS.text,
    border: COLORS.border,
    notification: COLORS.accent,
  },
};

function useProtectedRoute(
  session: Session | null,
  isLoading: boolean,
  ageState: 'verified' | 'blocked' | 'unknown' | 'loading',
) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (ageState === 'loading') return;

    const inAgeGate = segments[0] === 'age-gate';
    const inAuthGroup = segments[0] === 'auth';

    // 1) Age gate is the floor — everyone hits it first until they answer yes.
    if (ageState === 'unknown' && !inAgeGate) {
      router.replace('/age-gate');
      return;
    }
    if (ageState === 'blocked' && segments.join('/') !== 'age-gate/blocked') {
      router.replace('/age-gate/blocked');
      return;
    }

    // Don't redirect anyone OUT of age-gate routes — they own the flow once inside.
    if (inAgeGate) return;

    // 2) Auth gate. Anonymous (guest) users technically have a session but
    // should still be allowed into /auth so they can upgrade to a real
    // account — otherwise the paywall's "Sign in or create an account"
    // banner bounces them straight back to home.
    if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (session && inAuthGroup && !session.user?.is_anonymous) {
      router.replace('/(tabs)');
    }
  }, [session, segments, isLoading, ageState]);
}

function AnimatedSplash({
  onReady,
  onFinish,
}: {
  onReady?: () => void;
  onFinish: () => void;
}) {
  // The branded splash PNG is a 1284x1284 square (humidor lounge +
  // wordmark). On portrait phones (~2:1) we render it with resizeMode
  // "contain" so the full wordmark is visible — the image's dark-green
  // background matches COLORS.bg, so the top/bottom letterbox fills
  // seamlessly and reads as a single surface to the user.
  //
  // An earlier attempt used resizeMode "cover" to kill a perceived
  // letterbox artifact; on most phone aspect ratios that cropped the
  // left and right ~27% of the square, cutting "STICK PICKS" in half.
  // Not worth the visual risk — "contain" with matching bg is the
  // correct default for a square source on portrait devices.
  //
  // Ken-Burns pass (slow scale + slight vertical drift) still runs so
  // the reveal feels cinematic rather than flat. Durations are tuned
  // to the 1.6s hold: Ken-Burns runs 4s so we only ever see the first
  // ~40% of motion before the fade — the image is always in motion
  // when fade-out begins.
  const opacity = useSharedValue(1);
  const kenBurns = useSharedValue(0);

  useEffect(() => {
    // 4s ease-in-out is longer than the 1.6s hold by design; the user
    // only ever sees the first ~40% of the pan, which is the part with
    // the most visible motion-per-second.
    kenBurns.value = withTiming(1, {
      duration: 4000,
      easing: Easing.inOut(Easing.ease),
    });
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 450 }, () => {
        runOnJS(onFinish)();
      });
    }, 1600);
    return () => clearTimeout(timeout);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Zoom 1.00 → 1.08, drift up 3% — both subtle so the wordmark never
  // clips and the humidor doesn't crawl dramatically. Classic "premium
  // photo framing" motion.
  const imageStyle = useAnimatedStyle(() => {
    const scale = 1 + kenBurns.value * 0.08;
    const translateY = -kenBurns.value * 0.03 * 800; // ~24px drift on a phone
    return {
      transform: [{ scale }, { translateY }],
    };
  });

  return (
    <Animated.View
      style={[splashStyles.container, containerStyle]}
      // Fires once the splash view has been measured — a reliable signal
      // that the first frame is about to be painted. Used to hide the
      // native launch screen only AFTER this view is ready, eliminating
      // the gap where (tabs) could flash through.
      onLayout={() => onReady?.()}
    >
      <Animated.Image
        source={require('../assets/images/splash-icon.png')}
        style={[splashStyles.fullImage, imageStyle]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  // Absolute-fill with `resizeMode=contain` so the 1284x1284 square
  // scene fits entirely inside the viewport without cropping. The image
  // is inside a transform-animated wrapper (Ken Burns) — `absoluteFill
  // Object` gives that wrapper a stable origin so the zoom+pan always
  // lands centred. Matching bg color makes top/bottom letterbox visually
  // continuous with the image.
  fullImage: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Cormorant': require('../assets/fonts/Cormorant-Variable.ttf'),
    'Cormorant-Italic': require('../assets/fonts/Cormorant-Italic-Variable.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);
  const [animatedSplashReady, setAnimatedSplashReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const ageState = useAgeGateStore((s) => s.status);
  useHydrateAgeGate();

  // Init RevenueCat + observability (analytics + error reporting).
  // Observability is no-op when EXPO_PUBLIC_SENTRY_DSN / EXPO_PUBLIC_POSTHOG_API_KEY are empty.
  useEffect(() => {
    initErrorReporting();
    initAnalytics();
    initRevenueCat().catch((e) => {
      if (__DEV__) console.warn('[RevenueCat] Init failed:', e);
    });
    // Warm the brand-logo cache so CigarImage can fall back synchronously.
    // Never blocks boot — fire-and-forget, swallows its own errors.
    loadBrandLogos();
  }, []);

  // Listen for auth state changes + sync RevenueCat user
  useEffect(() => {
    const activate = useProStore.getState().activate;
    let identifiedUserId: string | null = null;

    const syncRevenueCat = async (userId: string) => {
      if (identifiedUserId === userId) return; // Prevent double-fire
      identifiedUserId = userId;
      try {
        await identifyUser(userId);
        const info = await getCustomerInfo();
        if (info && isProActive(info)) activate();
      } catch {
        // RevenueCat not available
      }
    };

    // Comped-user re-check on every session. Previously the comp flag was
    // only consulted on fresh sign-in (app/auth/login.tsx), which meant a
    // user already signed-in-from-earlier who got added to comped_users
    // later would never flip to Pro. This re-check closes that gap — safe
    // to run every session because the RPC only ever RETURNS a boolean
    // and never writes. Silently no-ops on network error.
    const maybeComp = async () => {
      try {
        const { data, error } = await supabase.rpc('is_current_user_comped');
        if (error) return;
        if (data === true) activate();
      } catch {
        // Transient / unreachable — retry on next session change.
      }
    };

    const onSession = (sess: Session | null) => {
      setSession(sess);
      setAuthLoading(false);
      if (sess?.user?.id) {
        syncRevenueCat(sess.user.id);
        // Non-anon only: comp check requires a real auth.uid() to resolve.
        if (!sess.user.is_anonymous) {
          void maybeComp();
        }
        identifyAnalytics(sess.user.id, { is_anonymous: !!sess.user.is_anonymous });
        setErrorUser({ id: sess.user.id, email: sess.user.email ?? null });
        // Streak cache hydration — pull on sign-in (or app boot with an
        // existing session) so the profile surface renders real numbers
        // immediately instead of AsyncStorage leftovers. Non-blocking;
        // if the network's down the cached values stay visible.
        if (!sess.user.is_anonymous) {
          pullAllStreaks(sess.user.id)
            .then((rows) => useStreakStore.getState().hydrate(rows))
            .catch(captureSilent('streak.hydrate'));
          // Fire-and-forget engagement tick — the act of opening the
          // app counts, and this handles the cold-boot case where the
          // AppState listener below doesn't see a transition (already
          // 'active' at mount).
          void recordActivity('engagement');
        }
      } else {
        resetAnalytics();
        setErrorUser(null);
        identifiedUserId = null;
        // Clear streak cache so the next signed-in user (or a guest
        // flow that ends at the signed-out state) doesn't see previous
        // user's numbers bleed through.
        useStreakStore.getState().reset();
      }
    };

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => onSession(session));

    // Subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      onSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // AppState → foreground: tick engagement streak with a 60s debounce so
  // rapid background/foreground toggles (switching to Messages and back)
  // don't spam the RPC. Gated on a signed-in, non-anonymous user so we
  // never ping the server for guests.
  useEffect(() => {
    let lastFiredAt = 0;
    const DEBOUNCE_MS = 60 * 1000;
    const handler = (status: AppStateStatus) => {
      if (status !== 'active') return;
      const user = session?.user;
      if (!user?.id || user.is_anonymous) return;
      const now = Date.now();
      if (now - lastFiredAt < DEBOUNCE_MS) return;
      lastFiredAt = now;
      void recordActivity('engagement');
    };
    const sub = AppState.addEventListener('change', handler);
    return () => sub.remove();
  }, [session]);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Hide the iOS native launch screen only once BOTH fonts are loaded AND the
  // JS AnimatedSplash has measured its first layout. Hiding earlier causes a
  // visible flash of whatever screen is underneath (usually (tabs)/index) before
  // the branded splash paints.
  useEffect(() => {
    if (loaded && animatedSplashReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, animatedSplashReady]);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Protect routes based on age + auth state
  useProtectedRoute(session, authLoading || showSplash, ageState);

  if (!loaded) return null;

  return (
    <ThemeProvider value={StickPicksDark}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="age-gate/index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="age-gate/blocked" options={{ gestureEnabled: false }} />
        <Stack.Screen name="auth/login" options={{ presentation: 'modal', gestureEnabled: false }} />
        <Stack.Screen name="quiz/index" />
        <Stack.Screen name="quiz/results" />
        <Stack.Screen name="identify/camera" />
        <Stack.Screen name="identify/result" />
        <Stack.Screen name="cigar/[id]" />
        {/* Paywall used to use presentation: 'modal', but the iOS modal sheet
            stayed layered behind the rest of the app after being dismissed,
            leaving white space at the top of subsequent screens. A regular
            stack push pops cleanly on router.back() and on tab navigation. */}
        <Stack.Screen name="paywall" />
        <Stack.Screen name="legal/privacy" options={{ presentation: 'modal' }} />
        <Stack.Screen name="legal/terms" options={{ presentation: 'modal' }} />
      </Stack>
      {showSplash && (
        <AnimatedSplash
          onReady={() => setAnimatedSplashReady(true)}
          onFinish={handleSplashFinish}
        />
      )}
      {/* Global host for themed Alert.alert — mounted once, never dismounts.
          Sits above the stack so dialogs float over every route, including
          modal-presented ones like paywall and legal screens. */}
      <StyledAlertHost />
      {/* Toast host for gamification feedback (streaks, future
          micro-confirmations). Non-modal, non-blocking, lives above all
          routes. See src/components/ui/Toast.tsx for the single-toast
          replacement behavior. */}
      <ToastHost />
    </ThemeProvider>
  );
}
