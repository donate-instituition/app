import { Text, type TextProps } from 'react-native';

import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { theme } from '@/src/theme';

import { styles } from './styles';

type TextVariant = keyof typeof styles;

type ThemedTextProps = TextProps & {
  color?: string;
  variant?: TextVariant;
};

export function ThemedText({ color, style, variant = 'body', ...props }: ThemedTextProps) {
  const scheme = useColorScheme() ?? 'light';

  return (
    <Text
      style={[{ color: color ?? theme.colors[scheme].text }, styles[variant], style]}
      {...props}
    />
  );
}
