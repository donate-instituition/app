import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
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
    paddingVertical: theme.spacing.sm,
  },
  donationInfo: {
    flex: 1,
    gap: theme.spacing.xxs,
  },
  donationRight: {
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  bold: {
    fontWeight: '600',
  },
});

