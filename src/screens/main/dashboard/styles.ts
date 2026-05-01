import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metric: {
    flexBasis: '47%',
    gap: theme.spacing.xs,
  },
  section: {
    gap: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  carouselCard: {
    marginRight: theme.spacing.md,
  },
});
