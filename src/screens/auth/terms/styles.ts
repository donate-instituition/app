import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  titleBlock: {
    gap: theme.spacing.xs,
  },
  contentBox: {
    borderRadius: theme.radius.lg,
    borderWidth: theme.borderWidths.sm,
    padding: theme.spacing.lg,
  },
  centered: {
    textAlign: 'center',
  },
});
