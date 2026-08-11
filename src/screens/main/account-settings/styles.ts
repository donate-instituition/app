import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    gap: theme.spacing.xl,
    paddingBottom: theme.spacing['2xl'],
    paddingTop: theme.spacing.lg,
  },
  header: {
    alignItems: 'flex-start',
    gap: theme.spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: theme.radius.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerText: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  formCard: {
    borderRadius: 20,
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 74,
    minWidth: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  rowIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  rowContent: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  rowRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontWeight: '600',
    marginLeft: theme.spacing.md,
  },
  profileSummary: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  avatarPressable: {
    alignItems: 'center',
  },
  avatarEdit: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 44,
    justifyContent: 'center',
    marginTop: -28,
    width: 44,
  },
  inputLike: {
    borderRadius: 14,
    borderWidth: theme.borderWidths.sm,
    gap: theme.spacing.xxs,
    minHeight: 72,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  splitRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  splitItem: {
    flex: 1,
    minWidth: 0,
  },
  actionButton: {
    marginTop: theme.spacing.xs,
  },
  dangerCard: {
    borderRadius: 18,
    gap: theme.spacing.md,
  },
  dangerButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    minHeight: 44,
  },
  helpHero: {
    alignItems: 'center',
    borderRadius: 20,
    gap: theme.spacing.md,
    minHeight: 210,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  helpIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  faqItem: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  faqRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    minWidth: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  faqIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  faqContent: {
    flex: 1,
    gap: theme.spacing.xs,
    minWidth: 0,
  },
  pressed: {
    opacity: 0.84,
  },
  apiError: {
    marginLeft: theme.spacing.md,
  },
});
