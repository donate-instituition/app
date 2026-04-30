import { borderWidths, radius } from './borders';
import { palette, semanticColors } from './colors';
import { shadows, spacing } from './spacing';
import { fontFamilies, typography } from './typography';

export const theme = {
  colors: semanticColors,
  typography,
  spacing,
  radius,
  borderWidths,
  shadows,
} as const;

export const Colors = semanticColors;
export const Fonts = typography.family;

export type AppTheme = typeof theme;
export type ThemeMode = keyof typeof semanticColors;

export { palette, semanticColors };
export type { AppColors, ColorSchemeName } from './colors';
export { borderWidths, radius };
export { shadows, spacing };
export { fontFamilies, typography };
