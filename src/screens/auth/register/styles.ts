import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerBlock: {
    gap: theme.spacing.sm,
  },
  donorHeader: {
    alignItems: 'center',
    paddingBottom: theme.spacing.xs,
  },
  heroIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: theme.borderWidths.sm,
    height: 64,
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    width: 64,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 40,
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    width: 40,
  },
  stepBadge: {
    alignSelf: 'flex-end',
    borderRadius: theme.radius.pill,
    borderWidth: theme.borderWidths.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    position: 'absolute',
    right: 0,
    top: -48,
  },
  stepper: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    paddingTop: theme.spacing.xs,
    width: 160,
  },
  stepDot: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: theme.borderWidths.sm,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: theme.spacing.md,
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
  pendingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  group: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  multilineInput: {
    minHeight: 88,
  },
  eyeButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  apiError: {
    textAlign: 'center',
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
});
