import { View, Text, TextInput, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';
import type { Cigar } from '@/src/types/cigar';

export default function BrowseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [cigars, setCigars] = useState<Cigar[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCigars = useCallback(async (search: string) => {
    setLoading(true);
    try {
      let q = supabase.from('cigars').select('*').order('brand').limit(100);
      if (search.trim()) {
        q = q.or(`brand.ilike.%${search}%,name.ilike.%${search}%`);
      }
      const { data } = await q;
      setCigars((data as Cigar[]) ?? []);
    } catch {
      setCigars([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchCigars(query), 300);
    return () => clearTimeout(timer);
  }, [query, fetchCigars]);

  const renderCigar = useCallback(({ item }: { item: Cigar }) => (
    <Card style={styles.cigarCard} onPress={() => router.push(`/cigar/${item.id}`)}>
      <View style={styles.cardRow}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Text style={styles.thumbText}>{item.brand.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cigarName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cigarBrand}>{item.brand}</Text>
          <View style={styles.flavors}>
            {item.flavors.slice(0, 3).map((f) => (
              <Badge key={f} label={f} />
            ))}
          </View>
        </View>
      </View>
    </Card>
  ), [router]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + SPACING.sm }]}>
      <Text style={styles.title}>Browse Cigars</Text>
      <TextInput
        style={styles.search}
        placeholder="Search by brand or name..."
        placeholderTextColor={COLORS.subtle}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        returnKeyType="search"
      />
      {loading ? (
        <ActivityIndicator color={COLORS.accent} style={{ marginTop: SPACING.xl }} />
      ) : (
        <FlatList
          data={cigars}
          keyExtractor={(c) => c.id}
          renderItem={renderCigar}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100, flexGrow: 1 }}
          showsVerticalScrollIndicator={true}
          indicatorStyle="white"
          bounces={true}
          alwaysBounceVertical={true}
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <EmptyState
              title="No cigars found"
              subtitle={query ? 'Try a different search term' : 'Cigars will appear here once data is seeded'}
            />
          }
          ListHeaderComponent={
            <Text style={styles.resultCount}>{cigars.length} cigars</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  search: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  resultCount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.subtle,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  list: {
    flex: 1,
  },
  cigarCard: {
    marginBottom: SPACING.sm,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.card2,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  thumbText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.accent,
  },
  cardContent: {
    flex: 1,
  },
  cigarName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  cigarBrand: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
    marginBottom: 6,
  },
  flavors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
});
