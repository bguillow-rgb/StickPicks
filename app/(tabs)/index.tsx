import { View, Text, StyleSheet, ImageBackground, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADIUS } from '@/src/constants/theme';

// Using high-quality Unsplash cigar images
const CIGARS_GROUP_IMG = 'https://images.unsplash.com/photo-1589461475640-d06e4290ba8d?w=800&q=80';
const SINGLE_CIGAR_IMG = 'https://images.unsplash.com/photo-1570303345338-e1f0eddf4946?w=800&q=80';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + SPACING.sm }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>STICK PICKS</Text>
          <View style={styles.brandRule} />
        </View>
        <Pressable onPress={() => router.push('/(tabs)/profile')} hitSlop={12}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={18} color={COLORS.accent} />
          </View>
        </Pressable>
      </View>

      <Text style={styles.welcome}>What are we smoking today?</Text>

      {/* CTA Cards */}
      <View style={styles.cards}>
        {/* Find Your Stick */}
        <Pressable
          onPress={() => router.push('/quiz')}
          style={({ pressed }) => [styles.ctaCard, pressed && styles.pressed]}
        >
          <ImageBackground
            source={{ uri: CIGARS_GROUP_IMG }}
            style={styles.ctaImage}
            imageStyle={styles.ctaImageInner}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['transparent', 'rgba(6,16,10,0.85)', 'rgba(6,16,10,0.95)']}
              style={styles.ctaGradient}
            >
              <View style={styles.ctaLabelRow}>
                <View style={styles.ctaDot} />
                <Text style={styles.ctaLabel}>RECOMMENDATION</Text>
              </View>
              <Text style={styles.ctaTitle}>Find Your Stick</Text>
              <Text style={styles.ctaSubtitle}>
                Take the quiz — we'll match your palate to the perfect cigar
              </Text>
            </LinearGradient>
          </ImageBackground>
        </Pressable>

        {/* Scan a Stick */}
        <Pressable
          onPress={() => router.push('/identify/camera')}
          style={({ pressed }) => [styles.ctaCard, pressed && styles.pressed]}
        >
          <ImageBackground
            source={{ uri: SINGLE_CIGAR_IMG }}
            style={styles.ctaImage}
            imageStyle={styles.ctaImageInner}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['transparent', 'rgba(6,16,10,0.85)', 'rgba(6,16,10,0.95)']}
              style={styles.ctaGradient}
            >
              <View style={styles.ctaLabelRow}>
                <View style={styles.ctaDot} />
                <Text style={styles.ctaLabel}>IDENTIFICATION</Text>
              </View>
              <Text style={styles.ctaTitle}>Scan a Stick</Text>
              <Text style={styles.ctaSubtitle}>
                Point your camera at any cigar band — we'll tell you everything
              </Text>
            </LinearGradient>
          </ImageBackground>
        </Pressable>
      </View>

      {/* Bottom tagline */}
      <Text style={styles.footer}>538 cigars in the library</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  brand: {
    fontFamily: FONTS.display,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 4,
  },
  brandRule: {
    width: 32,
    height: 2,
    backgroundColor: COLORS.accent,
    marginTop: 4,
    borderRadius: 1,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  welcome: {
    fontFamily: FONTS.display,
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    lineHeight: 34,
  },
  cards: {
    flex: 1,
    gap: SPACING.md,
  },
  ctaCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ctaImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  ctaImageInner: {
    borderRadius: RADIUS.lg,
  },
  ctaGradient: {
    padding: SPACING.md,
    paddingTop: SPACING.xxl,
  },
  ctaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  ctaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  ctaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 2,
  },
  ctaTitle: {
    fontFamily: FONTS.display,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.subtle,
    letterSpacing: 2,
    textTransform: 'uppercase',
    paddingVertical: SPACING.md,
  },
});
