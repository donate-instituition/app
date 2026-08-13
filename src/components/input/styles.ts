import { StyleSheet } from 'react-native';

import type { AppColors } from '@/theme';
import { theme } from '@/theme';

export type InputVariant = 'outline' | 'filled';

export function getInputColors(colors: AppColors, variant: InputVariant, hasError?: boolean) {
  return {
    backgroundColor: variant === 'filled' ? colors.surfaceMuted : colors.surface,
    borderColor: hasError ? colors.danger : colors.border,
    labelColor: colors.text,
    helperColor: hasError ? colors.danger : colors.textMuted,
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
    minWidth: 0,
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.font.inter.regular,
    fontSize: theme.typography.size.md,
    includeFontPadding: false,
    lineHeight: theme.typography.lineHeight.md,
    minWidth: 0,
    paddingVertical: theme.spacing.sm,
  },
  disabled: {
    opacity: 0.64,
  },
});
