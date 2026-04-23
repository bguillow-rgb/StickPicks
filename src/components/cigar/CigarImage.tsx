import { View, Text, Image, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, FONTS, SPACING } from '@/src/constants/theme';
import type { Cigar } from '@/src/types/cigar';
import type { ImageStyle, StyleProp } from 'react-native';
import { getBrandLogo } from '@/src/lib/brandLogos';

// Display-layer wrapper for every cigar image in the app. Centralizes the
// moderation rules so each call site doesn't re-implement them:
//   - image_status is 'takedown' or 'banned' → placeholder with "Add a photo"
//     affordance. Moderation wins over any fallback.
//   - image_url present + live                → use it
//   - image_url missing + brand logo available → render brand logo as fallback
//     (seeded by scripts/seed-brand-logos.ts; covers brands where we can't
//     find a per-vitola product shot)
//   - nothing matches                          → placeholder
//
// On the detail page showAddAction={true} exposes the "Add a photo" button
// when the moderation placeholder is showing.

interface CigarImageProps {
  cigar: Pick<Cigar, 'image_url' | 'image_status' | 'brand' | 'line' | 'name'> | null | undefined;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'center';
  showAddAction?: boolean;
  onAddPress?: () => void;
  uploading?: boolean;
}

function hasLiveImage(
  cigar: CigarImageProps['cigar']
): cigar is { image_url: string; image_status: 'live'; brand: string; line: string; name: string } {
  if (!cigar) return false;
  if (!cigar.image_url) return false;
  // Defensive: older rows without the column present should still display.
  if (cigar.image_status && cigar.image_status !== 'live') return false;
  return true;
}

export function CigarImage({
  cigar,
  style,
  resizeMode = 'cover',
  showAddAction = false,
  onAddPress,
  uploading = false,
}: CigarImageProps) {
  // Moderation first — an explicitly-pulled image MUST show the placeholder
  // with the add-photo affordance, regardless of any brand fallback. Falling
  // back to the brand logo here would re-expose content the admin just took
  // down for a different vitola.
  const takenDown = !!cigar?.image_status && cigar.image_status !== 'live';

  if (!takenDown && hasLiveImage(cigar)) {
    return <Image source={{ uri: cigar.image_url }} style={style} resizeMode={resizeMode} />;
  }

  // Brand-logo fallback — only when the image is simply missing (not moderated).
  // Gives the UI a brand-appropriate fill instead of a bare placeholder for the
  // ~1000+ cigars we can't find per-vitola photos for.
  if (!takenDown) {
    const brandLogo = cigar?.brand ? getBrandLogo(cigar.brand) : null;
    if (brandLogo) {
      return <Image source={{ uri: brandLogo }} style={style} resizeMode={resizeMode} />;
    }
  }

  return (
    <View style={[styles.placeholder, style]}>
      <Ionicons name="image-outline" size={28} color={COLORS.muted} />
      <Text style={styles.placeholderLabel} numberOfLines={2}>
        No image available
      </Text>
      {showAddAction && (
        <Pressable onPress={onAddPress} disabled={uploading} style={styles.addBtn} hitSlop={6}>
          {uploading ? (
            <ActivityIndicator size="small" color={COLORS.accent} />
          ) : (
            <>
              <Ionicons name="add" size={14} color={COLORS.accent} />
              <Text style={styles.addText}>Add a photo</Text>
            </>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  placeholderLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    textAlign: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  addText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
  },
});
