import { StyleSheet } from 'react-native';

import type { AppColors } from '@/theme';
import { theme } from '@/theme';

export type CardVariant = 'elevated' | 'outlined' | 'filled';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export function getCardColors(colors: AppColors, variant: CardVariant) {
  const variants = {
    elevated: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    outlined: {
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    filled: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.surfaceMuted,
    },
  } satisfies Record<CardVariant, Record<string, string>>;

  return variants[variant];
}

export const styles = StyleSheet.create({
  root: {
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidths.sm,
  },
  elevated: {
    ...theme.shadows.sm,
  },
  paddingNone: {
    padding: theme.spacing.none,
  },
  paddingSm: {
    padding: theme.spacing.sm,
  },
  paddingMd: {
    padding: theme.spacing.lg,
  },
  paddingLg: {
    padding: theme.spacing.xl,
  },
});
