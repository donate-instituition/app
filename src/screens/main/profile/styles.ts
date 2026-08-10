import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.xs,
  },
  identityCard: {
    borderRadius: 18,
    paddingVertical: theme.spacing.xl,
    shadowColor: '#102A24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  identity: {
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  institutionProfileIdentity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  institutionProfileText: {
    flex: 1,
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  identityInfo: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    maxWidth: '100%',
  },
  centered: {
    textAlign: 'center',
  },
  name: {
    maxWidth: 260,
    textAlign: 'center',
  },
  identityBadge: {
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontWeight: '600',
    marginLeft: theme.spacing.md,
  },
  roleSwitcher: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  roleOption: {
    alignItems: 'center',
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    minHeight: 38,
    minWidth: 0,
    paddingHorizontal: theme.spacing.md,
  },
  settingsError: {
    marginTop: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    minWidth: 0,
  },
  menuLabel: {
    flex: 1,
    minWidth: 0,
  },
  menuCard: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  logoutButton: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    minHeight: 42,
    marginTop: theme.spacing.xs,
  },
  logoutText: {
    fontWeight: '600',
  },
  profileCard: {
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  profileTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: theme.borderWidths.sm,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  socialStats: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  socialStat: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  profileActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  profileAction: {
    flex: 1,
  },
  stripeCard: {
    borderRadius: 18,
    borderWidth: theme.borderWidths.sm,
    gap: theme.spacing.md,
  },
  stripeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  stripeIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  list: {
    gap: theme.spacing.sm,
  },
  emptyPostCard: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  postCard: {
    gap: theme.spacing.md,
  },
  postAuthor: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  postStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
});
