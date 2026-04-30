import { View, type ViewProps } from 'react-native';

import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { theme } from '@/src/theme';

import { styles } from './styles';

type ProgressBarProps = ViewProps & {
  value: number;
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
};

function clampProgress(value: number, max: number) {
  if (max <= 0) {
    return 0;
  }

  return Math.min(Math.max(value / max, 0), 1);
}

export function ProgressBar({
  max = 100,
  style,
  value,
  variant = 'primary',
  ...props
}: ProgressBarProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const progress = clampProgress(value, max);
  const fillColors = {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  };

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ max, min: 0, now: value }}
      style={[styles.root, { backgroundColor: colors.surfaceMuted }, style]}
      {...props}>
      <View style={[styles.fill, { backgroundColor: fillColors[variant], width: `${progress * 100}%` }]} />
    </View>
  );
}
