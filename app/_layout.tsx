import { useEffect } from 'react';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { COLORS } from '@/src/constants/theme';

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

export default function RootLayout() {
  const [loaded, error] = useFonts({});

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

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
    </ThemeProvider>
  );
}
