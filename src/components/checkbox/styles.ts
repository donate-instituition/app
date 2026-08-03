import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  box: {
    alignItems: 'center',
    borderRadius: theme.radius.xs,
    borderWidth: theme.borderWidths.md,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkedDot: {
    borderRadius: theme.radius.xs,
    height: 10,
    width: 10,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  disabled: {
    opacity: 0.56,
  },
});
