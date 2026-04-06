import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/src/components/ui/Card';
import { COLORS, SPACING, FONTS } from '@/src/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + SPACING.md }]}>
      <Text style={styles.brand}>Stick Picks</Text>
      <Text style={styles.tagline}>Your cigar companion</Text>

      <View style={styles.cards}>
        <Card style={styles.ctaCard} onPress={() => router.push('/quiz')}>
          <View style={styles.ctaIcon}>
            <Ionicons name="sparkles-outline" size={32} color={COLORS.accent} />
          </View>
          <Text style={styles.ctaTitle}>Find Your Stick</Text>
          <Text style={styles.ctaSubtitle}>
            Take the quiz to find your perfect cigar match
          </Text>
        </Card>

        <Card style={styles.ctaCard} onPress={() => router.push('/identify/camera')}>
          <View style={styles.ctaIcon}>
            <Ionicons name="scan-outline" size={32} color={COLORS.accent} />
          </View>
          <Text style={styles.ctaTitle}>Scan a Stick</Text>
          <Text style={styles.ctaSubtitle}>
            Identify any cigar with your camera
          </Text>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.md,
  },
  brand: {
    fontFamily: FONTS.display,
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.accent,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  cards: {
    gap: SPACING.md,
  },
  ctaCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  ctaIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.card2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
