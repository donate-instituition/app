import { StyleSheet } from 'react-native';

import { theme } from '@/src/theme';

export const styles = StyleSheet.create({
  horizontal: {
    height: theme.borderWidths.sm,
    width: '100%',
  },
  vertical: {
    height: '100%',
    width: theme.borderWidths.sm,
  },
});
