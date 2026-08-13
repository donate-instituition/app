import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  root: {
    gap: theme.spacing.sm,
  },
  option: {
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minHeight: 88,
    minWidth: 0,
    padding: theme.spacing.lg,
  },
  optionContent: {
    flex: 1,
    minWidth: 0,
  },
  indicator: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: theme.borderWidths.md,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  indicatorDot: {
    borderRadius: theme.radius.pill,
    height: 10,
    width: 10,
  },
  disabled: {
    opacity: 0.56,
  },
});
