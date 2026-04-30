import { View, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { styles } from './styles';

type EmptyStateProps = ViewProps & {
  title: string;
  description?: string;
  action?: React.ReactNode;
  illustration?: React.ReactNode;
};

export function EmptyState({
  action,
  description,
  illustration,
  style,
  title,
  ...props
}: EmptyStateProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  return (
    <View style={[styles.root, style]} {...props}>
      {illustration}
      <View style={styles.content}>
        <ThemedText variant="subtitle">{title}</ThemedText>
        {description ? (
          <ThemedText variant="body" color={colors.textMuted}>
            {description}
          </ThemedText>
        ) : null}
      </View>
      {action}
    </View>
  );
}
