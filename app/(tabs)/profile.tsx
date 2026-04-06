import { View, Text, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { COLORS, SPACING, FONTS } from '@/src/constants/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/auth/login');
    } catch {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + SPACING.md }]}>
      <Text style={styles.title}>Profile</Text>

      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>SP</Text>
        </View>
        <Text style={styles.name}>Cigar Lover</Text>
        <Text style={styles.subtitle}>Guest Mode</Text>
      </Card>

      <Card style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>In Humidor</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Smoked</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Scans</Text>
          </View>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          title="Sign Out"
          variant="secondary"
          onPress={handleSignOut}
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.bg,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
  statsCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.accent,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  actions: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
});
