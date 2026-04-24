// Stack layout for admin surfaces. Header visible so users always
// have a way back out. Screen-level AdminOnly gating happens inside
// each screen, not here, so a deep-linked route enforces gating
// whether or not this layout loads first.

import { Stack } from 'expo-router';
import { COLORS } from '@/src/constants/theme';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.bg },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontFamily: 'Cormorant', fontWeight: '800' },
        contentStyle: { backgroundColor: COLORS.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Admin' }} />
      <Stack.Screen name="add-cigar" options={{ title: 'Add Cigar' }} />
      <Stack.Screen name="submissions" options={{ title: 'Review Submissions' }} />
      <Stack.Screen name="edit-cigar" options={{ title: 'Edit Cigars' }} />
      <Stack.Screen name="edit-cigar/[id]" options={{ title: 'Edit Cigar' }} />
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="invites" options={{ title: 'Admin Invites' }} />
    </Stack>
  );
}
