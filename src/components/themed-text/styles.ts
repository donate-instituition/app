import { StyleSheet } from 'react-native';

import { theme } from '@/src/theme';

export const styles = StyleSheet.create({
  body: {
    fontSize: theme.typography.size.md,
    lineHeight: theme.typography.lineHeight.md,
    fontWeight: theme.typography.weight.regular,
  },
  title: {
    fontSize: theme.typography.size['3xl'],
    lineHeight: theme.typography.lineHeight['3xl'],
    fontWeight: theme.typography.weight.bold,
  },
  subtitle: {
    fontSize: theme.typography.size.xl,
    lineHeight: theme.typography.lineHeight.xl,
    fontWeight: theme.typography.weight.semibold,
  },
  caption: {
    fontSize: theme.typography.size.sm,
    lineHeight: theme.typography.lineHeight.sm,
    fontWeight: theme.typography.weight.regular,
  },
  link: {
    fontSize: theme.typography.size.md,
    lineHeight: theme.typography.lineHeight.md,
    fontWeight: theme.typography.weight.semibold,
  },
});
