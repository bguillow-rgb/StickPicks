import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Meter } from '@/src/components/ui/Meter';
import { Button } from '@/src/components/ui/Button';
import { COLORS, SPACING, FONTS } from '@/src/constants/theme';
import { scoreQuiz } from '@/src/features/quiz/scoring';
import type { Cigar, QuizAnswers } from '@/src/types/cigar';

interface ScoredCigar {
  cigar: Cigar;
  score: number;
  reasons: string[];
}

export default function QuizResultsScreen() {
  const params = useLocalSearchParams<{ answers: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [results, setResults] = useState<ScoredCigar[]>([]);
  const [loading, setLoading] = useState(true);

  const answers: QuizAnswers = params.answers
    ? JSON.parse(params.answers)
    : { strength: null, smoothness: null, body: null, time: null, price: null, flavors: [], adventure: null };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('cigars').select('*');
        const cigars = (data as Cigar[]) ?? [];
        const scored = scoreQuiz(answers, cigars);
        setResults(scored);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const top = results[0];
  const alts = results.slice(1, 6);

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top + SPACING.md }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Your Match</Text>
      <Text style={styles.subheader}>
        {top ? 'A confident pick based on your preferences.' : 'Loading matches...'}
      </Text>

      {top && (
        <Card style={styles.heroCard} onPress={() => router.push(`/cigar/${top.cigar.id}`)}>
          <Text style={styles.kicker}>BEST MATCH</Text>
          <Text style={styles.heroName}>{top.cigar.name}</Text>
          <Text style={styles.heroBrand}>{top.cigar.brand}</Text>
          <View style={{ marginTop: SPACING.sm }}>
            <Meter label="Strength" value={top.cigar.strength} />
            <Meter label="Body" value={top.cigar.body} />
            <Meter label="Price" value={top.cigar.price_tier} />
          </View>
          <View style={styles.flavors}>
            {top.cigar.flavors.slice(0, 4).map((f) => (
              <Badge key={f} label={f} />
            ))}
          </View>
          {top.reasons.length > 0 && (
            <View style={styles.reasons}>
              <Text style={styles.reasonsTitle}>Why this match</Text>
              {top.reasons.map((r, i) => (
                <Text key={i} style={styles.reason}>{r}</Text>
              ))}
            </View>
          )}
        </Card>
      )}

      {alts.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>More Picks</Text>
          {alts.map((item, i) => (
            <Card
              key={item.cigar.id}
              style={styles.altCard}
              onPress={() => router.push(`/cigar/${item.cigar.id}`)}
            >
              <View style={styles.altHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.altName}>{item.cigar.name}</Text>
                  <Text style={styles.altBrand}>{item.cigar.brand}</Text>
                </View>
                <Text style={styles.altRank}>#{i + 2}</Text>
              </View>
              <View style={styles.flavors}>
                {item.cigar.flavors.slice(0, 3).map((f) => (
                  <Badge key={f} label={f} />
                ))}
              </View>
            </Card>
          ))}
        </>
      )}

      <Button
        title="Retake Quiz"
        variant="secondary"
        onPress={() => router.replace('/quiz')}
        style={{ marginTop: SPACING.md }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.md,
  },
  header: {
    fontFamily: FONTS.display,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  heroCard: {
    paddingVertical: SPACING.lg,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.accent,
    marginBottom: SPACING.xs,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  heroBrand: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: SPACING.sm,
  },
  flavors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: SPACING.sm,
  },
  reasons: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  reasonsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  reason: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  altCard: {
    marginBottom: SPACING.sm,
  },
  altHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  altName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  altBrand: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  altRank: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.subtle,
  },
});
