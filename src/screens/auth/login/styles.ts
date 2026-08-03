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
  centerText: {
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
  forgotLink: {
    alignSelf: 'flex-end',
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
  // Dev-only
  devBox: {
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  devButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
});
