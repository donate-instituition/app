import { View, type ViewProps } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { styles } from './styles';

type ProgressBarProps = ViewProps & {
  value: number;
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  trackColor?: string;
  fillColor?: string;
};

function clampProgress(value: number, max: number) {
  if (max <= 0) {
    return 0;
  }

  return Math.min(Math.max(value / max, 0), 1);
}

export function ProgressBar({
  fillColor,
  max = 100,
  style,
  trackColor,
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
      style={[styles.root, { backgroundColor: trackColor ?? colors.surfaceMuted }, style]}
      {...props}>
      <View
        style={[
          styles.fill,
          { backgroundColor: fillColor ?? fillColors[variant], width: `${progress * 100}%` },
        ]}
      />
    </View>
  );
}

