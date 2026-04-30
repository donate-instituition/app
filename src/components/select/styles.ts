import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  root: {
    gap: theme.spacing.sm,
  },
  trigger: {
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidths.sm,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalPanel: {
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    gap: theme.spacing.sm,
    maxHeight: '72%',
    padding: theme.spacing.lg,
  },
  option: {
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  disabled: {
    opacity: 0.56,
  },
});
