import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing['2xl'],
    paddingVertical: theme.spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  form: {
    gap: theme.spacing.md,
  },
  eyeButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  apiError: {
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.lg,
  },
  linkBold: {
    fontWeight: '600',
  },
});
