import { StyleSheet } from 'react-native';

import { theme } from '@/src/theme';

export type AvatarSize = 'sm' | 'md' | 'lg';

export const avatarSizes = {
  sm: 32,
  md: 48,
  lg: 72,
} as const;

export const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  smText: {
    fontSize: theme.typography.size.sm,
  },
  mdText: {
    fontSize: theme.typography.size.lg,
  },
  lgText: {
    fontSize: theme.typography.size['2xl'],
  },
});
