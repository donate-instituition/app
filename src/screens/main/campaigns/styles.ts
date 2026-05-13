import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  searchIcon: {
    paddingLeft: theme.spacing.sm,
    paddingRight: theme.spacing.xs,
  },
  categories: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  results: {
    gap: theme.spacing.md,
  },
  list: {
    gap: theme.spacing.sm,
  },
  campaignCard: {
    gap: theme.spacing.sm,
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  campaignMeta: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  goalRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  // placeholder compat
  section: {
    gap: theme.spacing.md,
  },
});

