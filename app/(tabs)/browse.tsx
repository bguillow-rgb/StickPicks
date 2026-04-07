import { View, Text, TextInput, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Meter } from '@/src/components/ui/Meter';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { COLORS, SPACING } from '@/src/constants/theme';
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
      let q = supabase.from('cigars').select('*').order('brand').limit(50);
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
      />
      {loading ? (
        <ActivityIndicator color={COLORS.accent} style={{ marginTop: SPACING.xl }} />
      ) : (
        <FlatList
          data={cigars}
          keyExtractor={(c) => c.id}
          showsVerticalScrollIndicator={true}
          indicatorStyle="white"
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          ListEmptyComponent={
            <EmptyState
              title="No cigars found"
              subtitle={query ? 'Try a different search term' : 'Cigars will appear here once data is seeded'}
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.cigarCard} onPress={() => router.push(`/cigar/${item.id}`)}>
              <Text style={styles.cigarName}>{item.name}</Text>
              <Text style={styles.cigarBrand}>{item.brand}</Text>
              <View style={styles.flavors}>
                {item.flavors.slice(0, 3).map((f) => (
                  <Badge key={f} label={f} />
                ))}
              </View>
              <Meter label="Strength" value={item.strength} />
              <Meter label="Body" value={item.body} />
            </Card>
          )}
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  cigarCard: {
    marginBottom: SPACING.sm,
  },
  cigarName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  cigarBrand: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: SPACING.sm,
  },
  flavors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.sm,
  },
});
