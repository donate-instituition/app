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
  section: {
    gap: theme.spacing.md,
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

  // Mode toggle (pill)
  modeToggle: {
    flexDirection: 'row',
    borderRadius: theme.radius.pill,
    minHeight: 58,
    padding: 4,
    gap: theme.spacing.xxs,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
  },
  modeButtonActive: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  modeButtonText: {
    textAlign: 'center',
  },
  modeButtonTextActive: {
    fontWeight: '600',
  },

  // Category filter chips
  categories: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    paddingRight: theme.spacing.xl,
  },
  filterBlock: {
    gap: theme.spacing.xs,
  },
  nearbyChip: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: theme.spacing.lg,
  },
  moreChip: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  nearbyChipLoading: {
    opacity: 0.78,
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

  // compat
  adminActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
  },
});
