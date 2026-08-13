import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { styles } from './styles';

type TextVariant = keyof typeof styles;

type ThemedTextProps = TextProps & {
  color?: string;
  variant?: TextVariant;
};

export function ThemedText({ color, style, variant = 'body', ...props }: ThemedTextProps) {
  const scheme = useColorScheme() ?? 'light';
  const flattenedStyle = StyleSheet.flatten([styles[variant], style]) as TextStyle;
  const fontFamily = getFontFamilyForWeight(flattenedStyle?.fontWeight);

  return (
    <Text
      allowFontScaling={false}
      style={[
        { color: color ?? theme.colors[scheme].text, includeFontPadding: false },
        styles[variant],
        style,
        { fontFamily },
      ]}
      {...props}
    />
  );
}

function getFontFamilyForWeight(fontWeight: TextStyle['fontWeight']) {
  if (fontWeight === '700' || fontWeight === 'bold') {
    return theme.typography.font.inter.bold;
  }

  if (fontWeight === '600') {
    return theme.typography.font.inter.semibold;
  }

  if (fontWeight === '500') {
    return theme.typography.font.inter.medium;
  }

  return theme.typography.font.inter.regular;
}
