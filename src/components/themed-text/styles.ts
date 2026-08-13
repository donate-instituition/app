import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  body: {
    ...theme.typography.style.body,
  },
  title: {
    ...theme.typography.style.title1,
  },
  subtitle: {
    ...theme.typography.style.section,
  },
  caption: {
    ...theme.typography.style.caption,
  },
  link: {
    ...theme.typography.style.body,
    fontWeight: theme.typography.weight.semibold,
  },
});
