import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    flex: 1,
  },
  adminAuditContainer: {
    flex: 1,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  adminHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  adminHeaderText: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  auditToolbar: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  chipRow: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
  },
  auditChip: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: theme.borderWidths.sm,
    height: 34,
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: theme.spacing.md,
  },
  auditTodayBadge: {
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    minHeight: 54,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  auditTodayIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  auditListCard: {
    overflow: 'hidden',
  },
  auditItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 66,
    paddingHorizontal: theme.spacing.md,
  },
  auditIconColumn: {
    alignItems: 'center',
    alignSelf: 'stretch',
    width: 30,
  },
  auditIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  auditLine: {
    flex: 1,
    width: 2,
  },
  auditLineSpacer: {
    flex: 1,
    width: 2,
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  iconButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  searchIcon: {
    paddingLeft: theme.spacing.md,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minWidth: 0,
    paddingVertical: theme.spacing.md,
  },
  conversationContent: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  conversationHeader: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  preview: {
    flex: 1,
    minWidth: 0,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bold: {
    fontWeight: '600',
  },
  section: {
    gap: theme.spacing.md,
  },
  bottomSheetBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: theme.spacing.md,
    maxHeight: '82%',
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  bottomSheetHandle: {
    alignSelf: 'center',
    borderRadius: theme.radius.pill,
    height: 4,
    marginBottom: theme.spacing.sm,
    width: 44,
  },
  modalHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  modalTitleBlock: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  institutionList: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  institutionOption: {
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 74,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  institutionOptionText: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  inlineLoading: {
    padding: 0,
  },
});
