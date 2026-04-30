import { semanticColors } from './colors';
import { radius, shadows, spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors: semanticColors,
  typography,
  spacing,
  radius,
  shadows,
} as const;

export const Colors = semanticColors;
export const Fonts = typography.family;

export type AppTheme = typeof theme;
export type ThemeMode = keyof typeof semanticColors;

export * from './colors';
export * from './spacing';
export * from './typography';
