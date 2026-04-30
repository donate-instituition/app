import { View, type ViewProps } from 'react-native';

import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { theme } from '@/src/theme';

import { getCardColors, styles, type CardPadding, type CardVariant } from './styles';

type CardProps = ViewProps & {
  variant?: CardVariant;
  padding?: CardPadding;
};

const paddingStyles = {
  none: styles.paddingNone,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
} satisfies Record<CardPadding, object>;

export function Card({ padding = 'md', style, variant = 'elevated', ...props }: CardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = getCardColors(theme.colors[scheme], variant);

  return (
    <View
      style={[
        styles.root,
        paddingStyles[padding],
        variant === 'elevated' ? styles.elevated : undefined,
        colors,
        style,
      ]}
      {...props}
    />
  );
}
