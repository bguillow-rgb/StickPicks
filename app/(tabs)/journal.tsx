import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/src/components/ui/Card';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { COLORS, SPACING } from '@/src/constants/theme';
import type { JournalEntry } from '@/src/types/cigar';

function StarRating({ value }: { value: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ fontSize: 14, color: i <= value ? COLORS.accent : COLORS.border }}>
          ★
        </Text>
      ))}
    </View>
  );
}

export default function JournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('journal_entries')
        .select('*, cigar:cigars(*)')
        .order('smoked_at', { ascending: false })
        .limit(50);
      setEntries((data as JournalEntry[]) ?? []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + SPACING.sm }]}>
      <Text style={styles.title}>Smoking Journal</Text>

      <FlatList
        data={entries}
        keyExtractor={(e) => e.id}
        showsVerticalScrollIndicator={true}
        indicatorStyle="white"
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        ListEmptyComponent={
          <EmptyState
            title="No smokes logged yet"
            subtitle="After you smoke a cigar, log it here with a rating and tasting notes."
            actionLabel="Browse Cigars"
            onAction={() => router.push('/(tabs)/browse')}
          />
        }
        renderItem={({ item }) => (
          <Card
            style={styles.entryCard}
            onPress={() => item.cigar_id && router.push(`/cigar/${item.cigar_id}`)}
          >
            <View style={styles.entryHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.entryName}>{item.cigar?.name ?? 'Unknown Cigar'}</Text>
                <Text style={styles.entryBrand}>{item.cigar?.brand ?? ''}</Text>
              </View>
              <StarRating value={item.rating} />
            </View>
            {item.notes ? (
              <Text style={styles.entryNotes} numberOfLines={2}>{item.notes}</Text>
            ) : null}
            <Text style={styles.entryDate}>
              {new Date(item.smoked_at).toLocaleDateString()}
            </Text>
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
    marginBottom: SPACING.md,
  },
  entryCard: {
    marginBottom: SPACING.sm,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  entryName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  entryBrand: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  entryNotes: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 8,
    lineHeight: 20,
  },
  entryDate: {
    fontSize: 12,
    color: COLORS.subtle,
    marginTop: 8,
  },
});
