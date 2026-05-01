import { StyleSheet } from 'react-native';

import type { AppColors } from '@/theme';
import { theme } from '@/theme';

export type FeedbackStateVariant = 'error' | 'success' | 'info' | 'warning';

export function getFeedbackColors(colors: AppColors, variant: FeedbackStateVariant) {
  const variants = {
    error: {
      backgroundColor: colors.secondarySoft,
      textColor: colors.danger,
    },
    success: {
      backgroundColor: colors.primarySoft,
      textColor: colors.success,
    },
    info: {
      backgroundColor: colors.infoSoft,
      textColor: colors.info,
    },
    warning: {
      backgroundColor: colors.accentSoft,
      textColor: colors.warning,
    },
  } satisfies Record<FeedbackStateVariant, Record<string, string>>;

  return variants[variant];
}

export const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    borderRadius: theme.radius.md,
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
});
