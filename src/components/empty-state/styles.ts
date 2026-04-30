import { StyleSheet } from 'react-native';

import { theme } from '@/src/theme';

export const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: theme.spacing.lg,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
});
