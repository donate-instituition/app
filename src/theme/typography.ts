import { Platform } from 'react-native';

export const interFontFamilies = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const fontFamilies = Platform.select({
  ios: {
    sans: interFontFamilies.regular,
    serif: interFontFamilies.regular,
    rounded: interFontFamilies.medium,
    mono: 'ui-monospace',
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "Inter, 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  default: {
    sans: interFontFamilies.regular,
    serif: interFontFamilies.regular,
    rounded: interFontFamilies.medium,
    mono: 'monospace',
  },
});

export const typography = {
  font: {
    inter: interFontFamilies,
  },
  family: fontFamilies,
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 32,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 26,
    xl: 30,
    '2xl': 34,
    '3xl': 38,
  },
  style: {
    title1: {
      fontFamily: interFontFamilies.semibold,
      fontSize: 32,
      fontWeight: '600',
      lineHeight: 38,
    },
    title2: {
      fontFamily: interFontFamilies.semibold,
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 30,
    },
    section: {
      fontFamily: interFontFamilies.medium,
      fontSize: 20,
      fontWeight: '500',
      lineHeight: 26,
    },
    body: {
      fontFamily: interFontFamilies.regular,
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    caption: {
      fontFamily: interFontFamilies.regular,
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    small: {
      fontFamily: interFontFamilies.medium,
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
    },
  },
} as const;
