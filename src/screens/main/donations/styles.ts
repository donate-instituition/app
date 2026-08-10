import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.xs,
  },
  donateHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  backBar: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 40,
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backBarTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
  },
  headerText: {
    flex: 1,
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  headerIconButton: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    position: 'relative',
    width: 42,
  },
  headerDot: {
    borderRadius: theme.radius.pill,
    height: 10,
    position: 'absolute',
    right: 6,
    top: 6,
    width: 10,
  },
  modeToggle: {
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    minHeight: 58,
    padding: 4,
  },
  modeButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    flex: 1,
    justifyContent: 'center',
  },
  modeButtonActive: {
    shadowColor: '#102A24',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  modeText: {
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  outlineChip: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minHeight: 44,
    paddingHorizontal: theme.spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
  },
  institutionDonationMetric: {
    flex: 1,
    gap: theme.spacing.sm,
    minHeight: 142,
  },
  metricCircle: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  searchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  searchInputWrap: {
    flex: 1,
  },
  searchIcon: {
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.sm,
  },
  filterButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: theme.borderWidths.sm,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  followGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  followCard: {
    borderRadius: 18,
    borderWidth: theme.borderWidths.sm,
    flexBasis: '47%',
    gap: theme.spacing.sm,
    minHeight: 136,
    padding: theme.spacing.md,
  },
  followIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  emptyFollowCard: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  followCampaignCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  list: {
    gap: theme.spacing.sm,
  },
  donationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    minWidth: 0,
    paddingVertical: theme.spacing.sm,
  },
  adminUserRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  donationInfo: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  donationRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: theme.spacing.xs,
  },
  institutionDonationList: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  institutionDonationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 92,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  inlineMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  cancelSubscriptionButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    borderWidth: theme.borderWidths.sm,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  bold: {
    fontWeight: '600',
  },
  postCard: {
    gap: theme.spacing.md,
  },
  donateCampaignCard: {
    borderRadius: 20,
    gap: theme.spacing.md,
  },
  postHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  verifiedLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    minWidth: 0,
  },
  followSmall: {
    minWidth: 86,
  },
  donateCampaignImage: {
    borderRadius: 16,
    height: 200,
    width: '100%',
  },
  donateProgressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  donateProgressTrack: {
    borderRadius: theme.radius.pill,
    flex: 1,
    height: 10,
    overflow: 'hidden',
  },
  donateProgressFill: {
    borderRadius: theme.radius.pill,
    height: '100%',
  },
  donateGoal: {
    alignItems: 'flex-end',
    minWidth: 86,
  },
  donateMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  verticalDivider: {
    height: 32,
    width: StyleSheet.hairlineWidth,
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
  postActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  postAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  donateAction: {
    marginLeft: 'auto',
    minWidth: 92,
  },
});
