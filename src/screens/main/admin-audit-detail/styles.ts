import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
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
    gap: theme.spacing.lg,
  },
  heroHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  heroIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  heroText: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  eventCode: {
    borderRadius: theme.radius.lg,
    borderWidth: theme.borderWidths.sm,
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
  },
  section: {
    gap: theme.spacing.md,
  },
  listCard: {
    overflow: 'hidden',
  },
  row: {
    gap: theme.spacing.xxs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  metadataCard: {
    gap: theme.spacing.sm,
  },
  metadataLine: {
    borderRadius: theme.radius.sm,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
    padding: theme.spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  bold: {
    fontWeight: '600',
  },
});
