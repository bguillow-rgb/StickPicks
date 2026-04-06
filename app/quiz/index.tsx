import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Button } from '@/src/components/ui/Button';
import { COLORS, SPACING, RADIUS, FONTS } from '@/src/constants/theme';
import { QUESTIONS } from '@/src/features/quiz/questions';
import { scoreQuiz } from '@/src/features/quiz/scoring';
import type { QuizAnswers } from '@/src/types/cigar';

export default function QuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    strength: null,
    smoothness: null,
    body: null,
    time: null,
    price: null,
    flavors: [],
    adventure: null,
  });
  const [computing, setComputing] = useState(false);

  const q = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  const canContinue = useMemo(() => {
    if (!q) return false;
    if (q.type === 'multi') return (answers[q.key as 'flavors'] as string[]).length > 0;
    return answers[q.key as keyof QuizAnswers] !== null;
  }, [answers, q]);

  const progress = step / (QUESTIONS.length - 1);

  function selectValue(value: any) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers((prev) => ({ ...prev, [q.key]: value }));
  }

  function toggleMulti(value: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers((prev) => {
      const cur = prev.flavors;
      if (cur.includes(value)) return { ...prev, flavors: cur.filter((x) => x !== value) };
      if (cur.length >= (q.max ?? 3)) return prev;
      return { ...prev, flavors: [...cur, value] };
    });
  }

  async function handleNext() {
    if (isLast) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setComputing(true);
      // Score will be computed on results page with DB data
      setTimeout(() => {
        setComputing(false);
        router.push({ pathname: '/quiz/results', params: { answers: JSON.stringify(answers) } });
      }, 600);
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + SPACING.md, paddingBottom: insets.bottom + SPACING.md }]}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <Text style={styles.stepLabel}>Question {step + 1} of {QUESTIONS.length}</Text>

      <Animated.View
        key={step}
        entering={FadeInRight.duration(250)}
        exiting={FadeOutLeft.duration(200)}
        style={styles.questionContainer}
      >
        <Text style={styles.title}>{q.title}</Text>
        <Text style={styles.subtitle}>{q.subtitle}</Text>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.options}
          showsVerticalScrollIndicator={false}
        >
          {q.options.map((opt) => {
            const selected =
              q.type === 'multi'
                ? answers.flavors.includes(opt.value as string)
                : answers[q.key as keyof QuizAnswers] === opt.value;

            return (
              <Pressable
                key={String(opt.value)}
                onPress={() => q.type === 'multi' ? toggleMulti(opt.value as string) : selectValue(opt.value)}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {q.type === 'multi' && (
          <Text style={styles.hint}>Selected {answers.flavors.length} of {q.max ?? 3}</Text>
        )}
      </Animated.View>

      <View style={styles.nav}>
        <Button
          title="Back"
          variant="secondary"
          onPress={() => step > 0 ? setStep(s => s - 1) : router.back()}
        />
        <Button
          title={isLast ? (computing ? 'Finding...' : 'See Matches') : 'Next'}
          onPress={handleNext}
          disabled={!canContinue || computing}
          loading={computing}
        />
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
  progressTrack: {
    height: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
  },
  stepLabel: {
    fontSize: 12,
    color: COLORS.subtle,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  questionContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    paddingBottom: SPACING.md,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    minWidth: '45%',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.bg,
  },
  hint: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 13,
    marginTop: SPACING.xs,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
});
