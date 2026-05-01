import { View, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { getFeedbackColors, styles, type FeedbackStateVariant } from './styles';

type FeedbackStateProps = ViewProps & {
  title: string;
  description?: string;
  variant?: FeedbackStateVariant;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
};

export function FeedbackState({
  description,
  primaryAction,
  secondaryAction,
  style,
  title,
  variant = 'info',
  ...props
}: FeedbackStateProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const feedbackColors = getFeedbackColors(colors, variant);

  return (
    <View style={[styles.root, { backgroundColor: feedbackColors.backgroundColor }, style]} {...props}>
      <View style={styles.content}>
        <ThemedText variant="subtitle" color={feedbackColors.textColor}>
          {title}
        </ThemedText>
        {description ? (
          <ThemedText variant="body" color={colors.textMuted}>
            {description}
          </ThemedText>
        ) : null}
      </View>
      {primaryAction || secondaryAction ? (
        <View style={styles.actions}>
          {secondaryAction}
          {primaryAction}
        </View>
      ) : null}
    </View>
  );
}
