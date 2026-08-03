import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  loginHero: {
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing['3xl'],
  },
  activationCard: {
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
    padding: theme.spacing.xl,
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
  inputIcon: {
    paddingLeft: theme.spacing.md,
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
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.lg,
  },
  linkBold: {
    fontWeight: '600',
  },
  orRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    minWidth: 0,
    paddingVertical: theme.spacing.xs,
  },
  orLine: {
    flex: 1,
  },
  securityBox: {
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minWidth: 0,
    padding: theme.spacing.md,
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
    minWidth: 0,
  },
  devButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
});
