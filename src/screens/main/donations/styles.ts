import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
  },
  section: {
    gap: theme.spacing.md,
  },
  donationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    minWidth: 0,
    paddingVertical: theme.spacing.sm,
  },
  donationInfo: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  donationRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: theme.spacing.xs,
  },
  bold: {
    fontWeight: '600',
  },
});
