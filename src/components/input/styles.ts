import { StyleSheet } from 'react-native';

import type { AppColors } from '@/theme';
import { theme } from '@/theme';

export type InputVariant = 'outline' | 'filled';

export function getInputColors(
  colors: AppColors,
  variant: InputVariant,
  state: { focused?: boolean; hasError?: boolean; success?: boolean }
) {
  const borderColor = (() => {
    if (state.hasError) {
      return colors.danger;
    }

    if (state.success) {
      return colors.success;
    }

    if (state.focused) {
      return colors.primary;
    }

    return colors.border;
  })();

  return {
    backgroundColor: variant === 'filled' ? colors.surfaceMuted : colors.surface,
    borderColor,
    labelColor: state.focused ? colors.primary : colors.text,
    helperColor: state.hasError ? colors.danger : state.success ? colors.success : colors.textMuted,
    placeholderColor: colors.textMuted,
    textColor: colors.text,
  };
}

export const styles = StyleSheet.create({
  root: {
    gap: theme.spacing.sm,
  },
  field: {
    alignItems: 'center',
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.size.md,
    lineHeight: theme.typography.lineHeight.md,
    paddingVertical: theme.spacing.sm,
  },
  disabled: {
    opacity: 0.64,
  },
});
