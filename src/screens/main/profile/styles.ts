import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  identity: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  identityInfo: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  centered: {
    textAlign: 'center',
  },
  section: {
    gap: theme.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  menuLabel: {
    flex: 1,
  },
});

