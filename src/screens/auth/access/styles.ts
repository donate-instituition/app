import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.xl,
    justifyContent: 'center',
    paddingVertical: theme.spacing['2xl'],
  },
  header: {
    gap: theme.spacing.sm,
  },
  options: {
    gap: theme.spacing.md,
  },
  optionCard: {
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 104,
    minWidth: 0,
    padding: theme.spacing.lg,
  },
  optionIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  optionText: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  checkSlot: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  actions: {
    gap: theme.spacing.md,
    marginTop: theme.spacing['3xl'],
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    justifyContent: 'center',
  },
  bold: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.86,
  },
});
