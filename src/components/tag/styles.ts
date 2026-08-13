import { StyleSheet } from 'react-native';

import type { AppColors } from '@/theme';
import { theme } from '@/theme';

export type TagVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export function getTagColors(colors: AppColors, variant: TagVariant) {
  const variants = {
    neutral: {
      backgroundColor: colors.surfaceMuted,
      textColor: colors.textMuted,
    },
    success: {
      backgroundColor: colors.primarySoft,
      textColor: colors.success,
    },
    warning: {
      backgroundColor: colors.accentSoft,
      textColor: colors.warning,
    },
    danger: {
      backgroundColor: colors.secondarySoft,
      textColor: colors.danger,
    },
    info: {
      backgroundColor: colors.infoSoft,
      textColor: colors.info,
    },
  } satisfies Record<TagVariant, Record<string, string>>;

  return variants[variant];
}

export const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    minHeight: 28,
    paddingHorizontal: theme.spacing.md,
    flexShrink: 0,
  },
});
