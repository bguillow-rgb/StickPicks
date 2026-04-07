import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
  withRepeat,
} from 'react-native-reanimated';
import 'react-native-reanimated';
import { COLORS, FONTS } from '@/src/constants/theme';

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

function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const smokeOpacity = useSharedValue(0);

  useEffect(() => {
    // Cigar icon fades in and pulses
    opacity.value = withTiming(1, { duration: 400 });
    scale.value = withSequence(
      withTiming(1.1, { duration: 600, easing: Easing.out(Easing.back(1.5)) }),
      withTiming(0.95, { duration: 300 }),
      withTiming(1, { duration: 300 }),
    );

    // Smoke wisps
    smokeOpacity.value = withDelay(500, withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800 }),
        withTiming(0.2, { duration: 800 }),
      ),
      3,
      true,
    ));

    // Text slides in
    textOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));

    // Fade out and finish
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 400 });
      textOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(onFinish)();
      });
    }, 2800);

    return () => clearTimeout(timeout);
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const smokeStyle = useAnimatedStyle(() => ({
    opacity: smokeOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={splashStyles.container}>
      {/* Gold decorative line */}
      <Animated.View style={[splashStyles.topLine, smokeStyle]} />

      {/* Cigar icon — built from shapes */}
      <Animated.View style={iconStyle}>
        <View style={splashStyles.cigarWrap}>
          {/* Smoke wisps above cigar */}
          <Animated.View style={[splashStyles.smokeWisps, smokeStyle]}>
            <Text style={splashStyles.smokeText}>⠀~⠀~⠀~</Text>
          </Animated.View>
          {/* Cigar body */}
          <View style={splashStyles.cigarBody}>
            <View style={splashStyles.cigarTip} />
            <View style={splashStyles.cigarBand} />
            <View style={splashStyles.cigarFoot} />
          </View>
        </View>
      </Animated.View>

      <Animated.View style={textStyle}>
        <Text style={splashStyles.brand}>STICK PICKS</Text>
        <View style={splashStyles.divider} />
        <Text style={splashStyles.tagline}>EST. 2025</Text>
      </Animated.View>

      <Animated.View style={[splashStyles.bottomLine, smokeStyle]} />
    </View>
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
  topLine: {
    position: 'absolute',
    top: '22%',
    width: 60,
    height: 2,
    backgroundColor: COLORS.accent,
    borderRadius: 1,
  },
  cigarWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  smokeWisps: {
    marginBottom: 6,
  },
  smokeText: {
    fontSize: 18,
    color: COLORS.subtle,
    letterSpacing: 4,
  },
  cigarBody: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 18,
  },
  cigarTip: {
    width: 12,
    height: 18,
    backgroundColor: '#8B4513',
    borderTopLeftRadius: 9,
    borderBottomLeftRadius: 9,
  },
  cigarBand: {
    width: 20,
    height: 18,
    backgroundColor: COLORS.accent,
    borderWidth: 1,
    borderColor: '#B8941E',
  },
  cigarFoot: {
    width: 100,
    height: 18,
    backgroundColor: '#6B3A2A',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  brand: {
    fontFamily: FONTS.display,
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.accent,
    textAlign: 'center',
    letterSpacing: 6,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.accent,
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 1,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    textAlign: 'center',
    letterSpacing: 4,
  },
  bottomLine: {
    position: 'absolute',
    bottom: '22%',
    width: 60,
    height: 2,
    backgroundColor: COLORS.accent,
    borderRadius: 1,
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({});
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (!loaded) return null;

  return (
    <ThemeProvider value={StickPicksDark}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" options={{ presentation: 'modal' }} />
        <Stack.Screen name="quiz/index" />
        <Stack.Screen name="quiz/results" />
        <Stack.Screen name="identify/camera" />
        <Stack.Screen name="identify/result" />
        <Stack.Screen name="cigar/[id]" />
      </Stack>
      {showSplash && <AnimatedSplash onFinish={handleSplashFinish} />}
    </ThemeProvider>
  );
}
