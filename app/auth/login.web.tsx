import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Alert } from '@/src/components/ui/StyledAlert';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/src/components/ui/Button';
import { COLORS, SPACING, FONTS } from '@/src/constants/theme';
import { useProStore } from '@/src/stores/useProStore';

// Web sign-in. Native Apple/Google SDKs don't exist in the browser, so this
// variant uses Supabase web OAuth (Google), passwordless email magic links, and
// anonymous guest mode. Guest is the zero-config path that always works; Google
// OAuth additionally requires the web origin to be added to Supabase Auth's
// redirect allow-list in the dashboard.
function redirectTo(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/app`;
}

export default function LoginScreenWeb() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const activatePro = useProStore((s) => s.activate);

  const maybeCompPro = async () => {
    try {
      const { data, error } = await supabase.rpc('is_current_user_comped');
      if (error) return;
      if (data === true) activatePro();
    } catch {
      // Non-blocking.
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectTo() },
      });
      if (error) throw error;
      // Browser redirects to Google; session is completed on return via
      // detectSessionInUrl (see lib/supabase.web.ts).
    } catch (e: any) {
      Alert.alert('Google Sign-In Error', e?.message ?? 'Unknown error');
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert('Enter your email', 'Add your email to get a sign-in link.');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: redirectTo() },
      });
      if (error) throw error;
      setEmailSent(true);
    } catch (e: any) {
      Alert.alert('Email Sign-In Error', e?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to continue as guest');
    } finally {
      setLoading(false);
    }
  };

  // After magic-link tap the browser returns here authenticated; comp Pro for
  // allowlisted accounts on the next render path. Kept simple for the web MVP.
  void maybeCompPro;

  return (
    <View style={styles.screen}>
      <View style={styles.inner}>
        <Text style={styles.brand}>STICK PICKS</Text>
        <View style={styles.brandRule} />
        <Text style={styles.tagline}>
          Sign in to sync your humidor and scan history — or jump right in as a guest.
        </Text>

        {emailSent ? (
          <View style={styles.buttons}>
            <Text style={styles.note}>
              Check {email.trim()} for a sign-in link. Open it on this device to finish.
            </Text>
            <Button title="Use a different email" variant="ghost" onPress={() => setEmailSent(false)} />
          </View>
        ) : (
          <View style={styles.buttons}>
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

            <TextInput
              style={styles.input}
              placeholder="you@email.com"
              placeholderTextColor={COLORS.subtle}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              inputMode="email"
            />
            <Button
              title="Email me a sign-in link"
              onPress={handleMagicLink}
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
        )}

        <Text style={styles.note}>Guest data stays in this browser. Sign in later to sync.</Text>

        <View style={styles.legalLinks}>
          <Pressable onPress={() => router.push('/legal/privacy')}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Pressable>
          <Text style={styles.legalDot}>{'\u00B7'}</Text>
          <Pressable onPress={() => router.push('/legal/terms')}>
            <Text style={styles.legalLink}>Terms of Use</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: SPACING.lg,
    paddingTop: 80,
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
    fontFamily: 'Cormorant',
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttons: {
    marginTop: SPACING.xxl,
    gap: SPACING.sm,
  },
  input: {
    fontFamily: 'Cormorant',
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
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
    fontFamily: 'Cormorant',
    fontSize: 13,
    color: COLORS.subtle,
  },
  note: {
    fontFamily: 'Cormorant',
    fontSize: 12,
    color: COLORS.subtle,
    textAlign: 'center',
    marginTop: SPACING.xl,
    lineHeight: 18,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xxl,
    gap: SPACING.sm,
  },
  legalLink: {
    fontFamily: 'Cormorant',
    fontSize: 12,
    color: COLORS.muted,
    textDecorationLine: 'underline',
  },
  legalDot: {
    color: COLORS.subtle,
    fontSize: 12,
  },
});
