// Web capture screen. The native scanner uses react-native-vision-camera, which
// has no browser equivalent. Since identification is an LLM-vision round-trip
// (not on-device OCR), all we need on web is to hand a photo to /identify/result
// — the existing identifyService + Supabase Edge Function already work in the
// browser (readFileAsBase64 has a fetch/blob fallback).
//
// We use a real DOM <input type="file" capture="environment">, which opens the
// rear camera on mobile browsers and a file picker on desktop — no extra deps.

import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';
import { track } from '@/src/lib/observability/analytics';
import { EVENTS } from '@/src/lib/observability/events';

function pickImage(capture: boolean): Promise<File | null> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(null);
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    // capture hints the rear camera on mobile; ignored on desktop.
    if (capture) input.setAttribute('capture', 'environment');
    input.style.display = 'none';
    input.onchange = () => {
      const file = input.files && input.files[0] ? input.files[0] : null;
      resolve(file);
      input.remove();
    };
    // If the dialog is dismissed there's no reliable 'cancel' event; the input is
    // GC'd on next pick. Resolve(null) only happens on an empty selection above.
    document.body.appendChild(input);
    input.click();
  });
}

export default function CameraScreenWeb() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    track(EVENTS.SCAN_STARTED, { source: 'web_capture' });
  }, []);

  // Reset busy state when navigating back to this screen.
  useFocusEffect(
    useCallback(() => {
      setBusy(false);
    }, [])
  );

  const handleCapture = useCallback(
    async (capture: boolean) => {
      if (busy) return;
      setBusy(true);
      track(EVENTS.SCAN_CONCIERGE_TAPPED, { source: capture ? 'web_camera' : 'web_upload' });
      const file = await pickImage(capture);
      if (!file) {
        setBusy(false);
        return;
      }
      const uri = URL.createObjectURL(file);
      router.replace({
        pathname: '/identify/result',
        params: { imageUris: JSON.stringify([uri]) },
      });
    },
    [busy, router]
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + SPACING.xl }]}>
      <View style={styles.inner}>
        <Ionicons name="sparkles" size={40} color={COLORS.accent} style={{ marginBottom: SPACING.md }} />
        <Text style={styles.title}>Identify a Cigar</Text>
        <Text style={styles.subtitle}>
          Snap or upload a clear photo of the band. Our Cigar Concierge reads it and finds the match.
        </Text>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>For the best match</Text>
          <Text style={styles.tip}>• Fill the frame with the band</Text>
          <Text style={styles.tip}>• Use even, bright light — avoid glare</Text>
          <Text style={styles.tip}>• Keep the text sharp and in focus</Text>
        </View>

        <Pressable
          onPress={() => handleCapture(true)}
          disabled={busy}
          style={[styles.primaryBtn, busy && { opacity: 0.6 }]}
        >
          {busy ? (
            <ActivityIndicator color={COLORS.bg} />
          ) : (
            <>
              <Ionicons name="camera" size={20} color={COLORS.bg} />
              <Text style={styles.primaryText}>Take a Photo</Text>
            </>
          )}
        </Pressable>

        <Pressable onPress={() => handleCapture(false)} disabled={busy} style={styles.secondaryBtn}>
          <Ionicons name="image-outline" size={18} color={COLORS.accent} />
          <Text style={styles.secondaryText}>Upload a Photo</Text>
        </Pressable>
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
    maxWidth: 440,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Cormorant',
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Cormorant',
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  tipsCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  tipsTitle: {
    fontFamily: 'Cormorant',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: COLORS.accent,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  tip: {
    fontFamily: 'Cormorant',
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: RADIUS.full,
    minHeight: 54,
  },
  primaryText: {
    fontFamily: 'Cormorant',
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.bg,
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.md,
    paddingVertical: 12,
  },
  secondaryText: {
    fontFamily: 'Cormorant',
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.accent,
  },
});
