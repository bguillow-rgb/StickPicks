import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@/lib/supabase';
import { Button } from '@/src/components/ui/Button';
import { COLORS, SPACING, FONTS } from '@/src/constants/theme';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const goHome = () => {
    router.replace('/(tabs)');
  };

  // ── Apple Sign-In ──
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
      Alert.alert('Apple Sign-In Error', e?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign-In via Supabase OAuth ──
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      const redirectTo = makeRedirectUri();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error('No auth URL returned');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success') {
        const url = new URL(result.url);
        // Extract tokens from URL fragment
        const params = new URLSearchParams(url.hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          goHome();
        }
      }
    } catch (e: any) {
      if (e?.message?.includes('canceled') || e?.message?.includes('dismiss')) return;
      Alert.alert('Google Sign-In Error', e?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // ── Guest Mode ──
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
    <View style={[styles.screen, { paddingTop: insets.top + 80 }]}>
      <Text style={styles.brand}>STICK PICKS</Text>
      <View style={styles.brandRule} />
      <Text style={styles.tagline}>
        Sign in to sync your humidor and scan history — or jump right in as a guest.
      </Text>

      <View style={styles.buttons}>
        {Platform.OS === 'ios' && (
          <Button
            title="Continue with Apple"
            onPress={handleAppleSignIn}
            disabled={loading}
            style={styles.appleBtn}
            textStyle={{ color: COLORS.bg }}
          />
        )}

        <Button
          title="Continue with Google"
          onPress={handleGoogleSignIn}
          variant="secondary"
          disabled={loading}
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          title="Continue as Guest"
          onPress={handleGuest}
          variant="ghost"
          disabled={loading}
        />
      </View>

      <Text style={styles.note}>
        Guest data stays on this device. Sign in later to sync.
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
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.accent,
    textAlign: 'center',
    letterSpacing: 6,
  },
  brandRule: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.accent,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: SPACING.md,
    borderRadius: 1,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttons: {
    marginTop: SPACING.xxl,
    gap: SPACING.sm,
  },
  appleBtn: {
    backgroundColor: COLORS.text,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginVertical: SPACING.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 13,
    color: COLORS.subtle,
  },
  note: {
    fontSize: 12,
    color: COLORS.subtle,
    textAlign: 'center',
    marginTop: SPACING.xl,
    lineHeight: 18,
  },
});
