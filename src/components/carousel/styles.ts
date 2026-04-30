import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  root: {
    gap: theme.spacing.md,
  },
  item: {
    overflow: 'hidden',
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    justifyContent: 'center',
  },
  dot: {
    borderRadius: theme.radius.pill,
    height: 8,
    width: 8,
  },
  activeDot: {
    width: 20,
  },
});
