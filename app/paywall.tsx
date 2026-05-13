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

// Copy is tight on purpose. Users scan, not read. Each bullet earns its spot
// by naming the one thing that distinguishes Pro from free and from other apps.
const FEATURES = [
  {
    icon: 'wine-outline' as const,
    title: 'Curated Drink Pairings',
    desc: 'Three curated pours per match — including one deep cut no other app surfaces.',
  },
  {
    icon: 'sparkles-outline' as const,
    title: 'Unlimited AI Identification',
    desc: 'Snap any band, find it in the catalog. Free gets 5; Pro is unlimited.',
  },
  {
    icon: 'flask-outline' as const,
    title: 'Detailed Humidor Builder',
    desc: '10 questions, top 10 matches for your collection, scored to your collecting profile. Free is 5 questions, 10 results.',
  },
  {
    icon: 'archive-outline' as const,
    title: 'Full Humidor',
    desc: 'Wishlist, owned, and logged — with pricing and resting days.',
  },
  {
    icon: 'star-outline' as const,
    title: 'Tasting Reviews',
    desc: 'Rate flavor profiles and build a personal tasting log.',
  },
  {
    icon: 'trending-up-outline' as const,
    title: 'New Features First',
    desc: 'Pro funds the roadmap — you get it before anyone else.',
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

  // Use real prices from RevenueCat when available. Fallbacks must match the
  // live App Store Connect prices so users never see a different number in
  // the paywall vs. the Apple purchase sheet — only shown if RevenueCat
  // offerings are still loading or unavailable.
  //
  // Fallback prices LAST VERIFIED against App Store Connect on 2026-05-13
  // (pre-Build-17 submission). Current ASC prices: $2.99/mo, $24.99/yr.
  // Plan is to bump to $4.99/$39.99 before public launch via Apple's Plan
  // Subscription Price Change flow (only available once a subscription has
  // been submitted for review at least once).
  //
  // RELEASE CHECKLIST — if you change ASC pricing, you MUST update the two
  // fallback literals on the next lines in the same commit. Otherwise users
  // on a slow connection (or a misconfigured RevenueCat) will see a stale
  // price here and an updated price in Apple's purchase sheet, which Apple
  // 3.1.1 treats as inaccurate pricing.
  const yearlyPrice = yearlyPackage?.product.priceString ?? '$24.99';
  const monthlyPrice = monthlyPackage?.product.priceString ?? '$2.99';
  // Per-month equivalent of the annual plan — Apple 3.1.2(a) requires this
  // to be shown alongside the annual price.
  const yearlyPerMonth = yearlyPackage
    ? `$${(yearlyPackage.product.price / 12).toFixed(2)}/month billed annually`
    : '$2.08/month billed annually';

  async function handlePurchase() {
    // Apple §5.1.1(v): subscriptions for non-account-based content must be
    // purchasable WITHOUT requiring sign-in first. Registration is allowed
    // only as an optional add-on for cross-device sync, never as a
    // precondition. Pour Picks was rejected for this exact pattern
    // (rejection ddcb15cf, build #17) and fixed in a118d8a.
    //
    // RevenueCat anonymous purchases bind to $RCAnonymousID:* on the
    // device; the entitlement still grants Pro features. If the user
    // later signs in, identifyUser() in app/_layout.tsx ties the
    // existing entitlement to their account.
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const pkg = selectedPlan === 'yearly' ? yearlyPackage : monthlyPackage;

    if (pkg) {
      // Real RevenueCat purchase — works for guests + signed-in users.
      const success = await buy(pkg);
      if (success) router.back();
    } else {
      // No packages available — RevenueCat not configured or no network
      Alert.alert('Unavailable', 'Subscriptions are not available right now. Please try again later.');
    }
  }

  async function handleRestore() {
    // §5.1.1(v): restore must be available to guests too. RevenueCat
    // restores anonymous purchases tied to the same Apple ID without
    // requiring app-side accounts.
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

      {/* No more guest banner here. Pour Picks ddcb15cf rejection
          (#5.1.1(v)) made it clear: any banner that implies sign-in is
          required to subscribe is itself a gate, even if the button
          below it works for guests. Guests now see an OPTIONAL
          sign-in link below the purchase CTA, framed around sync. */}

      {/* Header */}
      <Text style={styles.header}>Stick Picks Pro</Text>
      <Text style={styles.subheader}>Your personal collection reference</Text>

      {/* Pitch — one sentence, named differentiators only. Users scan paywalls
          rather than read them; we frontload the two claims no competitor can
          make and let the bullets do the rest. */}
      <View style={styles.pitchCard}>
        <Text style={styles.pitchHeadline}>
          The only humidor reference with AI band identification and curated drink pairings.
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
              <Text style={styles.planPerMonth}>{yearlyPerMonth}</Text>
              <Text style={styles.planSavings}>
                {yearlyPackage && monthlyPackage
                  ? `Save ${Math.round((1 - yearlyPackage.product.price / (monthlyPackage.product.price * 12)) * 100)}%`
                  : 'Save 33%'}
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

          {/* Apple §3.1.2(c) point-of-purchase disclosure block. Pour
              Picks ddcb15cf re-rejection forced this layout: title +
              auto-renew disclosure + Terms of Use + Privacy Policy
              must all be visible TOGETHER at the point of purchase.
              Bottom-of-page legal links don't count, and Apple's
              exact wording is "Terms of Use" (not "Terms of
              Service"). Apple §3.1.2(a) per-month equivalent for
              annual plans is satisfied by the plan card layout
              above. */}
          <Text style={styles.preCtaTitle}>STICK PICKS PRO</Text>
          <Text style={styles.preCtaDisclosure}>
            {selectedPlan === 'yearly'
              ? `Auto-renews at ${yearlyPrice}/year until canceled.`
              : `Auto-renews at ${monthlyPrice}/month until canceled.`}
          </Text>
          <View style={styles.preCtaLegalRow}>
            <Pressable onPress={() => router.push('/legal/terms')}>
              <Text style={styles.preCtaLegalLink}>Terms of Use</Text>
            </Pressable>
            <Text style={styles.preCtaLegalDot}>{'\u00B7'}</Text>
            <Pressable onPress={() => router.push('/legal/privacy')}>
              <Text style={styles.preCtaLegalLink}>Privacy Policy</Text>
            </Pressable>
          </View>

          {/* CTA — visible + tappable for guests too. Apple §5.1.1(v) */}
          <Button
            title={purchasing
              ? 'Processing...'
              : `Start Pro — ${selectedPlan === 'yearly' ? `${yearlyPrice}/yr` : `${monthlyPrice}/mo`}`
            }
            onPress={handlePurchase}
            disabled={purchasing}
            loading={purchasing}
            style={{ marginTop: SPACING.xs }}
          />

          {/* Optional sync sign-in for guests (Pour Picks a118d8a pattern).
              Demoted to a small text link BELOW the CTA so it never reads
              as a precondition for purchase. */}
          {isGuest && (
            <Pressable onPress={() => router.push('/auth/login')} style={styles.syncLinkBtn}>
              <Text style={styles.syncLinkText}>
                Sign in to sync your humidor across devices (optional)
              </Text>
            </Pressable>
          )}
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
  planPerMonth: {
    fontFamily: 'Cormorant',
    fontSize: 11,
    color: COLORS.subtle,
    marginTop: 2,
    textAlign: 'center',
  },
  // Point-of-purchase disclosure block (Apple §3.1.2(c)). Title +
  // auto-renew + Terms of Use + Privacy must all read as ONE block
  // immediately above the Start Pro CTA. Pour Picks ddcb15cf was
  // re-rejected because legal links lived at the bottom of the
  // scroll content; moved them up here to fix it for Stick Picks
  // pre-emptively.
  preCtaTitle: {
    fontFamily: 'Cormorant',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textAlign: 'center',
    color: COLORS.accent,
    marginTop: SPACING.md,
  },
  preCtaDisclosure: {
    fontFamily: 'Cormorant',
    fontSize: 11,
    color: COLORS.subtle,
    textAlign: 'center',
    marginTop: 4,
  },
  preCtaLegalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 4,
    marginBottom: SPACING.xs,
  },
  preCtaLegalLink: {
    fontFamily: 'Cormorant',
    fontSize: 11,
    color: COLORS.accent,
    textDecorationLine: 'underline',
  },
  preCtaLegalDot: {
    color: COLORS.subtle,
    fontSize: 11,
  },
  // Optional sync link for guests, sits below the Start Pro CTA.
  // Demoted styling so it never reads as a precondition.
  syncLinkBtn: {
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingVertical: 8,
  },
  syncLinkText: {
    fontFamily: 'Cormorant',
    fontSize: 12,
    color: COLORS.muted,
    textDecorationLine: 'underline',
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
    marginBottom: SPACING.lg,
    lineHeight: 16,
  },
});
