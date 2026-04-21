import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Alert } from '@/src/components/ui/StyledAlert';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { Button } from '@/src/components/ui/Button';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';
import { useProStore } from '@/src/stores/useProStore';
import { useRevenueCat } from '@/src/hooks/useRevenueCat';

type Plan = 'monthly' | 'yearly';

// Pitch copy — leaned hard into the AI + pairings differentiators. Each bullet
// is framed around what Pro unlocks that other apps can't do. Order matters:
// pairings first (biggest "only app that does this" moment), then AI scans,
// then the quiz depth, then the practical stuff.
const FEATURES = [
  {
    icon: 'wine-outline' as const,
    title: 'Thoughtful Drink Pairings — On Every Cigar',
    desc: "Three hand-curated pours per cigar: a crowd-pleaser, a category twist, and one deep cut you won't find anywhere else. Mezcal with a peppery Padrón. Pedro Ximénez with a creamy Connecticut. No other cigar app does this.",
  },
  {
    icon: 'sparkles-outline' as const,
    title: 'Unlimited AI Cigar Identification',
    desc: "Snap a photo of any band — our AI Concierge tells you exactly what you're smoking, even for boutique sticks other apps have never heard of. Free accounts get 5; Pro gets unlimited.",
  },
  {
    icon: 'flask-outline' as const,
    title: 'The 9-Question Precision Quiz',
    desc: 'Free gets you 3 questions. Pro opens the full taste profile — wrapper preference, origin, strength curve, flavor depth — and returns the top 10 cigars that actually match you, not the 3 most popular picks.',
  },
  {
    icon: 'archive-outline' as const,
    title: 'Your Complete Humidor',
    desc: 'Wishlist, owned, and smoked — all in one place, with resting days, per-vitola pricing, and community ratings. Free is limited to owned only.',
  },
  {
    icon: 'star-outline' as const,
    title: 'Personal Tasting Reviews',
    desc: 'Rate draw, burn, and flavor on every cigar you smoke. Build a private journal that gets smarter about your palate over time.',
  },
  {
    icon: 'trending-up-outline' as const,
    title: 'Early Access to New Features',
    desc: 'Pro members get every new feature first — and your subscription directly funds the next one.',
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
  const [isGuest, setIsGuest] = useState(false);
  const activate = useProStore((s) => s.activate);
  const {
    monthlyPackage,
    yearlyPackage,
    loading: rcLoading,
    purchasing,
    buy,
    restore,
  } = useRevenueCat();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setIsGuest(data.user?.is_anonymous ?? true);
    })();
  }, []);

  // Use real prices from RevenueCat when available, fall back to hardcoded
  const yearlyPrice = yearlyPackage?.product.priceString ?? '$24.99';
  const monthlyPrice = monthlyPackage?.product.priceString ?? '$2.99';

  async function handlePurchase() {
    if (isGuest) {
      Alert.alert(
        'Account Required',
        'Create an account or sign in to subscribe to Pro. Your purchase will be linked to your account.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth/login') },
        ]
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const pkg = selectedPlan === 'yearly' ? yearlyPackage : monthlyPackage;

    if (pkg) {
      // Real RevenueCat purchase
      const success = await buy(pkg);
      if (success) router.back();
    } else {
      // No packages available — RevenueCat not configured or no network
      Alert.alert('Unavailable', 'Subscriptions are not available right now. Please try again later.');
    }
  }

  async function handleRestore() {
    if (isGuest) {
      Alert.alert(
        'Account Required',
        'Sign in to restore a previous purchase.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth/login') },
        ]
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (yearlyPackage || monthlyPackage) {
      const success = await restore();
      if (success) router.back();
    } else {
      Alert.alert('Unavailable', 'Restore is not available right now. Please try again later.');
    }
  }

  return (
    <ScrollView
      style={[styles.screen]}
      // Regular stack push (not a modal) — add insets.top so the close X and
      // header clear the status bar / notch.
      contentContainerStyle={{
        paddingTop: insets.top + SPACING.md,
        paddingBottom: insets.bottom + 40,
      }}
    >
      {/* Close */}
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeBtn}>
        <Ionicons name="close" size={24} color={COLORS.muted} />
      </Pressable>

      {/* Guest banner */}
      {isGuest && (
        <Pressable onPress={() => router.push('/auth/login')} style={styles.guestBanner}>
          <Ionicons name="person-outline" size={16} color={COLORS.accent} />
          <Text style={styles.guestBannerText}>Sign in or create an account to subscribe</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.accent} />
        </Pressable>
      )}

      {/* Header */}
      <Text style={styles.header}>Stick Picks Pro</Text>
      <Text style={styles.subheader}>Your personal cigar sommelier</Text>

      {/* Pitch — the two-sentence sell. Written to stop the scroll: lead with
          the unique AI angle and the pairings hook, then validate the promise
          with the features below. */}
      <View style={styles.pitchCard}>
        <Text style={styles.pitchHeadline}>
          The only cigar app with AI-powered identification and expert-curated drink pairings.
        </Text>
        <Text style={styles.pitchBody}>
          Point your camera at any band and know what you're smoking. Get three thoughtfully-paired pours for every cigar — from bourbon classics to deep cuts like mezcal, PX sherry, and Madeira. Built for the serious enthusiast, not the casual smoker.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f.title} style={styles.featureRow}>
            <Ionicons name={f.icon} size={22} color={COLORS.accent} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {rcLoading ? (
        <ActivityIndicator color={COLORS.accent} style={{ marginVertical: SPACING.lg }} />
      ) : (
        <>
          {/* Plan selection */}
          <View style={styles.plans}>
            <Pressable
              onPress={() => setSelectedPlan('yearly')}
              style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardSelected]}
            >
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>BEST VALUE</Text>
              </View>
              <Text style={styles.planPrice}>{yearlyPrice}</Text>
              <Text style={styles.planPeriod}>per year</Text>
              <Text style={styles.planSavings}>
                {yearlyPackage && monthlyPackage
                  ? `Save ${Math.round((1 - yearlyPackage.product.price / (monthlyPackage.product.price * 12)) * 100)}%`
                  : 'Save 30%'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedPlan('monthly')}
              style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
            >
              <Text style={styles.planPrice}>{monthlyPrice}</Text>
              <Text style={styles.planPeriod}>per month</Text>
              <Text style={styles.planSavings}>Cancel anytime</Text>
            </Pressable>
          </View>

          {/* CTA */}
          <Button
            title={purchasing
              ? 'Processing...'
              : `Start Pro — ${selectedPlan === 'yearly' ? `${yearlyPrice}/yr` : `${monthlyPrice}/mo`}`
            }
            onPress={handlePurchase}
            disabled={purchasing}
            loading={purchasing}
            style={{ marginTop: SPACING.md }}
          />
        </>
      )}

      <Pressable onPress={handleRestore} style={styles.restoreBtn}>
        <Text style={styles.restoreText}>Restore Purchase</Text>
      </Pressable>

      <Text style={styles.legal}>
        Payment will be charged to your Apple ID account at confirmation of purchase.
        Subscription automatically renews unless canceled at least 24 hours before the end of the current period.
        Subscriptions may be managed and auto-renewal may be turned off in your Account Settings after purchase.
      </Text>

      <View style={styles.legalLinks}>
        <Pressable onPress={() => router.push('/legal/privacy')}>
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </Pressable>
        <Text style={styles.legalDot}>{'\u00B7'}</Text>
        <Pressable onPress={() => router.push('/legal/terms')}>
          <Text style={styles.legalLink}>Terms of Service</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.md,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.sm,
  },
  header: {
    fontFamily: 'Cormorant',
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.accent,
    textAlign: 'center',
  },
  subheader: {
    fontFamily: 'Cormorant',
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  // Pitch card frames the two-sentence sell above the features grid. Gold
  // border on dark-green card echoes the section-title treatment from the
  // cigar detail page — reads as editorial, not marketing.
  pitchCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  pitchHeadline: {
    fontFamily: 'Cormorant',
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  pitchBody: {
    fontFamily: 'Cormorant',
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 21,
  },
  features: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'Cormorant',
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  featureDesc: {
    fontFamily: 'Cormorant',
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  plans: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  planCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
  },
  planCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.card,
  },
  planBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginBottom: SPACING.xs,
  },
  planBadgeText: {
    fontFamily: 'Cormorant',
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.bg,
    letterSpacing: 1,
  },
  planPrice: {
    fontFamily: 'Cormorant',
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  planPeriod: {
    fontFamily: 'Cormorant',
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  planSavings: {
    fontFamily: 'Cormorant',
    fontSize: 11,
    color: COLORS.accent,
    marginTop: 4,
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  guestBannerText: {
    fontFamily: 'Cormorant',
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
  restoreBtn: {
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: 12,
  },
  restoreText: {
    fontFamily: 'Cormorant',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.muted,
  },
  legal: {
    fontFamily: 'Cormorant',
    fontSize: 11,
    color: COLORS.subtle,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 16,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  legalLink: {
    fontFamily: 'Cormorant',
    fontSize: 11,
    color: COLORS.muted,
    textDecorationLine: 'underline',
  },
  legalDot: {
    color: COLORS.subtle,
    fontSize: 11,
  },
});
