import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';
import type { HumidorItem } from '@/src/types/cigar';

const FILTERS = ['all', 'wishlist', 'owned', 'smoked'] as const;
type Filter = typeof FILTERS[number];

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  wishlist: 'Wishlist',
  owned: 'Owned',
  smoked: 'Smoked',
};

export default function HumidorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('all');
  const [items, setItems] = useState<HumidorItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from('humidor_items')
        .select('*, cigar:cigars(*)')
        .order('updated_at', { ascending: false });
      if (filter !== 'all') {
        q = q.eq('status', filter);
      }
      const { data } = await q;
      setItems((data as HumidorItem[]) ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered = items;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + SPACING.sm }]}>
      <Text style={styles.title}>My Humidor</Text>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.chip, filter === f && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {FILTER_LABELS[f]}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={true}
        indicatorStyle="white"
        bounces={true}
        alwaysBounceVertical={true}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            title="Your humidor is empty"
            subtitle="Save cigars from recommendations or browse to build your collection."
            actionLabel="Browse Cigars"
            onAction={() => router.push('/(tabs)/browse')}
          />
        }
        renderItem={({ item }) => (
          <Card
            style={styles.itemCard}
            onPress={() => item.cigar_id && router.push(`/cigar/${item.cigar_id}`)}
          >
            <View style={styles.itemHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.cigar?.name ?? 'Unknown'}</Text>
                <Text style={styles.itemBrand}>{item.cigar?.brand ?? ''}</Text>
              </View>
              <Badge
                label={item.status}
                color={
                  item.status === 'owned' ? COLORS.success :
                  item.status === 'smoked' ? COLORS.accent :
                  COLORS.info
                }
              />
            </View>
          </Card>
        )}
      />
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
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted,
  },
  chipTextActive: {
    color: COLORS.bg,
  },
  itemCard: {
    marginBottom: SPACING.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  itemBrand: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
});
