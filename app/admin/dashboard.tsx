// Stub — real implementation lands in a later commit.

import { View, Text, StyleSheet } from 'react-native';
import { AdminOnly } from '@/src/features/admin/AdminOnly';
import { COLORS } from '@/src/constants/theme';

export default function DashboardScreen() {
  return (
    <AdminOnly>
      <View style={styles.center}>
        <Text style={styles.text}>Dashboard — coming soon.</Text>
      </View>
    </AdminOnly>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg,
  },
  text: {
    fontFamily: 'Cormorant',
    color: COLORS.muted,
    fontSize: 16,
  },
});
