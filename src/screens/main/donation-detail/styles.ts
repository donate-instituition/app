import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.sm,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  hero: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  statusIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 86,
    justifyContent: 'center',
    width: 86,
  },
  centered: {
    textAlign: 'center',
  },
  receiptCard: {
    gap: theme.spacing.md,
  },
  receiptHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
  },
  rowValue: {
    flex: 1,
    fontWeight: '700',
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: theme.borderWidths.sm,
    flex: 1,
    gap: theme.spacing.xs,
    justifyContent: 'center',
    minHeight: 82,
    padding: theme.spacing.sm,
  },
  section: {
    gap: theme.spacing.md,
  },
  bold: {
    fontWeight: '700',
  },
});
