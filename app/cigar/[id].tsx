import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Meter } from '@/src/components/ui/Meter';
import { Button } from '@/src/components/ui/Button';
import { COLORS, SPACING, FONTS, RADIUS } from '@/src/constants/theme';
import type { Cigar } from '@/src/types/cigar';

export default function CigarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cigar, setCigar] = useState<Cigar | null>(null);
  const [loading, setLoading] = useState(true);
  const [similar, setSimilar] = useState<Cigar[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('cigars').select('*').eq('id', id).single();
        const c = data as Cigar | null;
        setCigar(c);

        if (c) {
          // Fetch similar cigars (same brand or similar strength/body)
          const { data: simData } = await supabase
            .from('cigars')
            .select('*')
            .neq('id', id)
            .or(`brand.eq.${c.brand},strength.eq.${c.strength}`)
            .limit(6);
          setSimilar((simData as Cigar[]) ?? []);
        }
      } catch {
        setCigar(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAddToHumidor = async (status: 'wishlist' | 'owned' | 'smoked') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Sign In Required', 'Sign in to save cigars to your humidor.');
        return;
      }
      const { error } = await supabase.from('humidor_items').upsert({
        user_id: user.id,
        cigar_id: id,
        status,
      }, { onConflict: 'user_id,cigar_id' });

      if (error) throw error;
      Alert.alert('Saved', `Added to your ${status} list.`);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to save');
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!cigar) {
    return (
      <View style={[styles.screen, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Cigar not found</Text>
        <Button title="Go Back" variant="ghost" onPress={() => router.back()} style={{ marginTop: SPACING.md }} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.screen]}
      contentContainerStyle={{ paddingTop: insets.top + SPACING.md, paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={true}
      indicatorStyle="white"
    >
      {/* Back button */}
      <Button title="Back" variant="ghost" onPress={() => router.back()} style={styles.backBtn} />

      {/* Hero */}
      <View style={styles.hero}>
        {cigar.image_url ? (
          <Image
            source={{ uri: cigar.image_url }}
            style={styles.heroImg}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.heroImage}>
            <Ionicons name="leaf-outline" size={48} color={COLORS.accent} />
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={styles.brand}>{cigar.brand}</Text>
      <Text style={styles.name}>{cigar.name}</Text>
      {cigar.vitola && <Text style={styles.vitola}>{cigar.vitola}</Text>}
      {cigar.origin && (
        <Text style={styles.origin}>{cigar.origin}</Text>
      )}

      {/* Meters */}
      <Card style={styles.metersCard}>
        <Meter label="Strength" value={cigar.strength} />
        <Meter label="Body" value={cigar.body} />
        <Meter label="Price" value={cigar.price_tier} />
      </Card>

      {/* Flavors */}
      {cigar.flavors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flavor Notes</Text>
          <View style={styles.flavors}>
            {cigar.flavors.map((f) => (
              <Badge key={f} label={f} />
            ))}
          </View>
        </View>
      )}

      {/* Description */}
      {cigar.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasting Notes</Text>
          <Text style={styles.description}>{cigar.description}</Text>
        </View>
      )}

      {/* Details grid */}
      <Card style={styles.detailsGrid}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Wrapper</Text>
          <Text style={styles.detailValue}>{cigar.wrapper ?? '—'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Binder</Text>
          <Text style={styles.detailValue}>{cigar.binder ?? '—'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Filler</Text>
          <Text style={styles.detailValue}>{cigar.filler?.join(', ') ?? '—'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Origin</Text>
          <Text style={styles.detailValue}>{cigar.origin ?? '—'}</Text>
        </View>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button title="Add to Wishlist" onPress={() => handleAddToHumidor('wishlist')} />
        <Button title="Mark as Owned" variant="secondary" onPress={() => handleAddToHumidor('owned')} />
        <Button title="Log a Smoke" variant="secondary" onPress={() => handleAddToHumidor('smoked')} />
      </View>

      {/* Similar cigars */}
      {similar.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Similar Cigars</Text>
          {similar.slice(0, 4).map((s) => (
            <Card key={s.id} style={styles.similarCard} onPress={() => router.push(`/cigar/${s.id}`)}>
              <Text style={styles.similarName}>{s.name}</Text>
              <Text style={styles.similarBrand}>{s.brand}</Text>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.md,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '700',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  hero: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heroImg: {
    width: 160,
    height: 160,
    borderRadius: 24,
    backgroundColor: COLORS.card,
  },
  heroImage: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    fontFamily: FONTS.display,
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  vitola: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 4,
  },
  origin: {
    fontSize: 13,
    color: COLORS.subtle,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  metersCard: {
    marginBottom: SPACING.md,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  flavors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  description: {
    fontSize: 15,
    color: COLORS.muted,
    lineHeight: 22,
  },
  detailsGrid: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.muted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  actions: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  similarCard: {
    marginBottom: SPACING.sm,
  },
  similarName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  similarBrand: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
});
