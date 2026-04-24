// Stub — real implementation lands in a later commit. This screen
// will let the admin search + pick an existing cigar, then route to
// /admin/edit-cigar/[id] for the edit form.

import { View, Text, StyleSheet } from 'react-native';
import { AdminOnly } from '@/src/features/admin/AdminOnly';
import { COLORS } from '@/src/constants/theme';

export default function EditCigarPickerScreen() {
  return (
    <AdminOnly>
      <View style={styles.center}>
        <Text style={styles.text}>Edit Cigars picker — coming soon.</Text>
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
