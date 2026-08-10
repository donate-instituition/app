import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  backBar: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 42,
  },
  backButton: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  backTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
  },
  heroCard: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  heroText: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    gap: theme.spacing.xs,
    minWidth: 140,
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listCard: {
    overflow: 'hidden',
  },
  row: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  rowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  rowTitle: {
    flex: 1,
    minWidth: 0,
  },
  emptyCard: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  bold: {
    fontWeight: '600',
  },
});
