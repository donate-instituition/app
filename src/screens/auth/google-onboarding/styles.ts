import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  pendingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoMark: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 64,
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    width: 64,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  options: {
    gap: theme.spacing.md,
  },
  optionCard: {
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 104,
    minWidth: 0,
    padding: theme.spacing.lg,
  },
  optionIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  optionText: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  checkSlot: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  bold: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.86,
  },
  form: {
    gap: theme.spacing.md,
  },
  multilineInput: {
    minHeight: 88,
  },
  apiError: {
    textAlign: 'center',
  },
  continueButton: {
    marginTop: theme.spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 40,
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    width: 40,
  },
  termsBlock: {
    gap: theme.spacing.xs,
  },
  termsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  linkBold: {
    fontWeight: '600',
  },
  eyeButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  sectionTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    minWidth: 0,
  },
  sectionIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
