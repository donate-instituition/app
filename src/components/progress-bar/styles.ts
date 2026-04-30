import { StyleSheet } from 'react-native';

import { theme } from '@/src/theme';

export const styles = StyleSheet.create({
  root: {
    borderRadius: theme.radius.pill,
    height: 10,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: theme.radius.pill,
    height: '100%',
  },
});
