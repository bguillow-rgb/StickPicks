import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/lib/supabase';
import { Button } from '@/src/components/ui/Button';
import { COLORS, SPACING, FONTS } from '@/src/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const goHome = () => {
    router.replace('/(tabs)');
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not available', 'Apple Sign-In is only available on iOS.');
      return;
    }

    try {
      setLoading(true);

      const rawNonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!credential.identityToken) {
        Alert.alert('Error', 'No identity token received from Apple.');
        return;
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: rawNonce,
      });

      if (error) throw error;
      goHome();
    } catch (e: any) {
      if (e?.code === 'ERR_REQUEST_CANCELED') return;
      Alert.alert('Sign-In Error', e?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Google Sign-In will be configured with Supabase OAuth
    Alert.alert('Coming Soon', 'Google Sign-In will be available shortly.');
  };

  const handleGuest = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      goHome();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to continue as guest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 60 }]}>
      <Text style={styles.brand}>Stick Picks</Text>
      <Text style={styles.tagline}>
        Sign in to sync your humidor and scan history across devices.
      </Text>

      <View style={styles.buttons}>
        <Button
          title="Continue with Apple"
          onPress={handleAppleSignIn}
          disabled={loading}
          style={styles.appleBtn}
          textStyle={{ color: COLORS.bg }}
        />

        <Button
          title="Continue with Google"
          onPress={handleGoogleSignIn}
          variant="secondary"
          disabled={loading}
        />

        <Button
          title="Continue as Guest"
          onPress={handleGuest}
          variant="ghost"
          disabled={loading}
        />
      </View>

      <Text style={styles.note}>
        Guest data is stored on this device only.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.lg,
  },
  brand: {
    fontFamily: FONTS.display,
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.accent,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  buttons: {
    marginTop: SPACING.xxl,
    gap: SPACING.sm,
  },
  appleBtn: {
    backgroundColor: COLORS.text,
  },
  note: {
    fontSize: 12,
    color: COLORS.subtle,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});
