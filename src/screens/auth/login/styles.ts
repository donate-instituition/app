import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  header: {
    gap: theme.spacing.sm,
  },
  form: {
    gap: theme.spacing.md,
  },
  roleList: {
    gap: theme.spacing.sm,
  },
});
