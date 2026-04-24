// Stub — real implementation lands in the next commit. The AdminOnly
// wrapper still enforces gating so this route can never be navigated
// to by a non-admin.

import { View, Text, StyleSheet } from 'react-native';
import { AdminOnly } from '@/src/features/admin/AdminOnly';
import { COLORS } from '@/src/constants/theme';

export default function AddCigarScreen() {
  return (
    <AdminOnly>
      <View style={styles.center}>
        <Text style={styles.text}>Add Cigar — coming in the next commit.</Text>
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
