import { StyleSheet } from 'react-native';

import type { AppColors } from '@/theme';
import { theme } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export function getButtonColors(colors: AppColors, variant: ButtonVariant, disabled?: boolean) {
  if (disabled) {
    return {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
      textColor: colors.textMuted,
      loaderColor: colors.textMuted,
    };
  }

  const variants = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      textColor: colors.surface,
      loaderColor: colors.surface,
    },
    secondary: {
      backgroundColor: colors.secondarySoft,
      borderColor: colors.secondarySoft,
      textColor: colors.secondary,
      loaderColor: colors.secondary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: colors.border,
      textColor: colors.primary,
      loaderColor: colors.primary,
    },
    danger: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
      textColor: colors.surface,
      loaderColor: colors.surface,
    },
  } satisfies Record<ButtonVariant, Record<string, string>>;

  return variants[variant];
}

export const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 0,
  },
  fullWidth: {
    width: '100%',
  },
  sm: {
    minHeight: 36,
    paddingHorizontal: theme.spacing.md,
  },
  md: {
    minHeight: 44,
    paddingHorizontal: theme.spacing.lg,
  },
  lg: {
    minHeight: 52,
    paddingHorizontal: theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    minWidth: 0,
  },
  label: {
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.72,
  },
});
