import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { identifyCigar } from '@/src/features/identify/identifyService';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Meter } from '@/src/components/ui/Meter';
import { Button } from '@/src/components/ui/Button';
import { COLORS, SPACING, FONTS } from '@/src/constants/theme';
import type { Cigar } from '@/src/types/cigar';

export default function IdentifyResultScreen() {
  const params = useLocalSearchParams<{ imageUri: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [cigar, setCigar] = useState<Cigar | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!params.imageUri) {
        setError('No image provided');
        setLoading(false);
        return;
      }

      try {
        const result = await identifyCigar(params.imageUri);
        setCigar(result.cigar);
        setConfidence(result.confidence);
        setReasoning(result.reasoning);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to identify cigar');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.imageUri]);

  const handleConfirm = () => {
    Alert.alert('Confirmed', 'Thanks! This helps improve our identification accuracy.');
    if (cigar) {
      router.push(`/cigar/${cigar.id}`);
    }
  };

  const handleCorrect = () => {
    Alert.alert('Coming Soon', 'Manual correction will be available in the next update.');
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Identifying your cigar...</Text>
      </View>
    );
  }

  if (error || !cigar) {
    return (
      <View style={[styles.screen, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorTitle}>Couldn't identify this cigar</Text>
        <Text style={styles.errorSubtitle}>{error ?? 'No match found in our database'}</Text>
        <Button title="Try Again" onPress={() => router.replace('/identify/camera')} style={{ marginTop: SPACING.md }} />
        <Button title="Go Home" variant="ghost" onPress={() => router.replace('/(tabs)')} style={{ marginTop: SPACING.sm }} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top + SPACING.md }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {params.imageUri && (
        <Image source={{ uri: params.imageUri }} style={styles.preview} resizeMode="cover" />
      )}

      <Card style={styles.resultCard}>
        <Text style={styles.kicker}>IDENTIFIED</Text>
        <Text style={styles.cigarName}>{cigar.name}</Text>
        <Text style={styles.cigarBrand}>{cigar.brand}</Text>

        {confidence !== null && (
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>Confidence</Text>
            <Text style={styles.confidenceValue}>{Math.round(confidence * 100)}%</Text>
          </View>
        )}

        <View style={{ marginTop: SPACING.sm }}>
          <Meter label="Strength" value={cigar.strength} />
          <Meter label="Body" value={cigar.body} />
          <Meter label="Price" value={cigar.price_tier} />
        </View>

        <View style={styles.flavors}>
          {cigar.flavors.slice(0, 5).map((f) => (
            <Badge key={f} label={f} />
          ))}
        </View>

        {reasoning ? (
          <Text style={styles.reasoning}>{reasoning}</Text>
        ) : null}
      </Card>

      <Text style={styles.confirmTitle}>Is this correct?</Text>
      <View style={styles.confirmRow}>
        <Button title="Yes, that's it!" onPress={handleConfirm} style={{ flex: 1 }} />
        <Button title="Not quite..." variant="secondary" onPress={handleCorrect} style={{ flex: 1 }} />
      </View>

      <Button
        title="View Full Details"
        variant="ghost"
        onPress={() => router.push(`/cigar/${cigar.id}`)}
        style={{ marginTop: SPACING.sm }}
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.muted,
    marginTop: SPACING.md,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.card,
  },
  resultCard: {
    marginBottom: SPACING.md,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.accent,
    marginBottom: SPACING.xs,
  },
  cigarName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  cigarBrand: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: SPACING.sm,
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  confidenceLabel: {
    fontSize: 13,
    color: COLORS.muted,
  },
  confidenceValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.success,
  },
  flavors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: SPACING.sm,
  },
  reasoning: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: SPACING.md,
    lineHeight: 20,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  confirmRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
});
