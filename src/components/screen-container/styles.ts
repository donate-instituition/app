import { StyleSheet } from 'react-native';

import { theme } from '@/src/theme';

export type ScreenContainerPadding = 'none' | 'sm' | 'md' | 'lg';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  paddingNone: {
    padding: theme.spacing.none,
  },
  paddingSm: {
    padding: theme.spacing.lg,
  },
  paddingMd: {
    padding: theme.spacing.xl,
  },
  paddingLg: {
    padding: theme.spacing['2xl'],
  },
});
