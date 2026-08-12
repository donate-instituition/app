import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  // Layout
  container: {
    gap: 24,
    paddingBottom: 8,
    paddingTop: theme.spacing['2xl'],
  },
  header: {
    gap: theme.spacing.sm,
  },
  exploreHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  headerIconButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    width: 44,
  },
  headerDot: {
    borderRadius: theme.radius.pill,
    height: 10,
    position: 'absolute',
    right: 7,
    top: 8,
    width: 10,
  },
  centered: {
    marginTop: theme.spacing['4xl'],
  },
  list: {
    gap: theme.spacing.lg,
  },
  toast: {
    alignItems: 'flex-start',
    borderRadius: 18,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  toastClose: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  toastText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  toastTitle: {
    fontWeight: '600',
  },
  section: {
    gap: theme.spacing.md,
  },
  institutionCampaignHeader: {
    gap: theme.spacing.xs,
  },
  institutionCampaignIntro: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  adminInstitutionsHeader: {
    gap: theme.spacing.sm,
  },
  adminInstitutionsIntro: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  adminPendingBadge: {
    alignItems: 'center',
    borderRadius: 16,
    minWidth: 54,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  adminInstitutionsContent: {
    gap: theme.spacing.md,
  },
  adminSearchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  adminSearchInputWrap: {
    flex: 1,
    minWidth: 0,
  },
  adminSearchInput: {
    borderRadius: 14,
    minHeight: 56,
  },
  adminFilterButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: theme.borderWidths.sm,
    height: 56,
    justifyContent: 'center',
    position: 'relative',
    width: 56,
  },
  adminFilterBadge: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 18,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 7,
    width: 18,
  },
  adminBottomSheetBackdrop: {
    backgroundColor: 'rgba(16, 42, 36, 0.32)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  adminBottomSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: theme.spacing.lg,
    maxHeight: '82%',
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing['2xl'],
  },
  adminBottomSheetHandle: {
    alignSelf: 'center',
    borderRadius: theme.radius.pill,
    height: 4,
    width: 44,
  },
  adminBottomSheetHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  adminBottomSheetSection: {
    gap: theme.spacing.sm,
  },
  adminStateFilters: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.lg,
  },
  adminSortOptions: {
    gap: theme.spacing.sm,
  },
  adminSortOption: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
    minHeight: 72,
    padding: theme.spacing.md,
  },
  adminStatusFilters: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.lg,
  },
  adminStatusFilter: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: theme.borderWidths.sm,
    justifyContent: 'center',
    minHeight: 38,
    minWidth: 82,
    paddingHorizontal: theme.spacing.lg,
  },
  adminInstitutionCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 92,
  },
  adminInstitutionIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  adminInstitutionInfo: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  adminLocationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  adminStatusTag: {
    maxWidth: 92,
  },
  adminInlineActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'flex-end',
    marginTop: -theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  discoverPosts: {
    gap: theme.spacing.md,
    paddingRight: theme.spacing.xl,
  },
  discoverPostCard: {
    gap: theme.spacing.md,
    minHeight: 160,
    width: 260,
  },
  discoverPostHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  discoverAvatar: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  discoverPostAuthor: {
    flex: 1,
    minWidth: 0,
  },
  discoverPostStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },

  // Search input icon
  searchIcon: {
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.sm,
  },
  searchField: {
    borderRadius: 18,
    minHeight: 62,
    shadowColor: '#102A24',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },

  newCampaignCard: {
    gap: theme.spacing.md,
  },
  stepper: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  stepDot: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  stepLine: {
    flex: 1,
    height: 4,
    marginHorizontal: theme.spacing.xs,
  },
  uploadBox: {
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    borderStyle: 'dashed',
    borderWidth: theme.borderWidths.sm,
    gap: theme.spacing.xs,
    padding: theme.spacing.xl,
  },
  mockField: {
    gap: theme.spacing.xs,
  },
  fakeInput: {
    borderRadius: theme.radius.lg,
    borderWidth: theme.borderWidths.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  recurringSetting: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  recurringSettingText: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  recurringToggle: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  institutionCampaignCard: {
    borderRadius: 20,
    gap: theme.spacing.lg,
  },
  institutionCampaignTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  institutionCampaignIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 78,
    justifyContent: 'center',
    width: 78,
  },
  institutionCampaignTitle: {
    flex: 1,
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  institutionCampaignStats: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.lg,
    justifyContent: 'center',
  },
  statBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  verticalDivider: {
    height: 44,
    width: StyleSheet.hairlineWidth,
  },
  institutionCampaignActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  campaignActionButton: {
    flex: 1,
  },
  draftCard: {
    alignItems: 'center',
    borderStyle: 'dashed',
    borderRadius: 20,
    flexDirection: 'row',
    gap: theme.spacing.md,
  },

  // Results counter
  results: {
    gap: theme.spacing.md,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  resultsTitle: {
    flex: 1,
    minWidth: 0,
  },
  resultsCount: {
    flexShrink: 0,
    maxWidth: 88,
    textAlign: 'right',
  },

  // Campaign card internals
  campaignCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.lg,
    minHeight: 132,
  },
  featureCampaignCard: {
    gap: theme.spacing.lg,
  },
  featureCampaignThumb: {
    alignItems: 'center',
    borderRadius: 16,
    height: 184,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  featureCampaignInfo: {
    gap: theme.spacing.sm,
  },
  campaignThumb: {
    alignItems: 'center',
    borderRadius: 18,
    height: 104,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 104,
  },
  campaignImage: {
    height: '100%',
    width: '100%',
  },
  campaignInfo: {
    flex: 1,
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  cardTitle: {
    flex: 1,
    fontWeight: '700',
    minWidth: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.xs,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  goalText: {
    flexShrink: 0,
    textAlign: 'right',
  },
  exploreCard: {
    borderRadius: 20,
    borderWidth: 0,
    shadowColor: '#102A24',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.11,
    shadowRadius: 24,
    elevation: 5,
  },
  metaLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  metaIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  metaText: {
    flex: 1,
    minWidth: 0,
  },
  bold: {
    fontWeight: '700',
  },

  // Institution card internals
  institutionCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.lg,
    minHeight: 176,
  },
  institutionInfo: {
    flex: 1,
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  institutionAvatar: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 78,
    justifyContent: 'center',
    width: 78,
  },
  institutionTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    minWidth: 0,
  },
  institutionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    minWidth: 0,
  },
  institutionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xxs,
    flexShrink: 0,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  featureStatsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  featureGoal: {
    alignItems: 'flex-end',
  },
  featureFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  supportersRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
  supporterAvatar: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  supporterAvatarImage: {
    height: '100%',
    width: '100%',
  },
  supportersLabel: {
    marginLeft: theme.spacing.xs,
  },
  featureDonateButton: {
    minWidth: 128,
  },
  recommendedInstitutionCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 108,
  },
  followButton: {
    minWidth: 96,
  },

  // Post card (unified explore feed)
  postAuthor: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  postAuthorText: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  postStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  postImage: {
    borderRadius: 16,
    height: 200,
    width: '100%',
  },
  feedActions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.light.border,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-around',
    paddingTop: theme.spacing.md,
  },
  feedAction: {
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

  // compat
  adminActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
  },
});
