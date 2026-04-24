// Stub — real implementation lands in a later commit. Will let admins
// list current admins, add a new email to comped_users with
// is_admin=true, or demote an existing admin by flipping is_admin=false
// (keeping the comp row).

import { View, Text, StyleSheet } from 'react-native';
import { AdminOnly } from '@/src/features/admin/AdminOnly';
import { COLORS } from '@/src/constants/theme';

export default function InvitesScreen() {
  return (
    <AdminOnly>
      <View style={styles.center}>
        <Text style={styles.text}>Admin Invites — coming soon.</Text>
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
