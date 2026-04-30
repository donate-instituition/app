import { ActivityIndicator, View, type ViewProps } from 'react-native';

import { ThemedText } from '@/src/components/themed-text';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { theme } from '@/src/theme';

import { styles } from './styles';

type LoadingProps = ViewProps & {
  label?: string;
  size?: 'small' | 'large';
};

export function Loading({ label, size = 'large', style, ...props }: LoadingProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  return (
    <View accessibilityRole="progressbar" style={[styles.root, style]} {...props}>
      <ActivityIndicator color={colors.primary} size={size} />
      {label ? (
        <ThemedText variant="body" color={colors.textMuted}>
          {label}
        </ThemedText>
      ) : null}
    </View>
  );
}
