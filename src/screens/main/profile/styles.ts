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
  settingsBackBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsBackButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsHeaderTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
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
  postActions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.light.border,
    flexDirection: 'row',
    gap: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  postAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  commentBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  commentSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: theme.spacing.md,
    maxHeight: '82%',
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  commentHandle: {
    alignSelf: 'center',
    borderRadius: theme.radius.pill,
    height: 4,
    marginBottom: theme.spacing.sm,
    width: 44,
  },
  commentHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  commentHeaderText: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  commentCloseButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  commentEmpty: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
  },
  commentList: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  commentItem: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  commentBody: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  commentInputRow: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 44,
  },
  commentSendButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
});
