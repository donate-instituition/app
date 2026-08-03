import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  greeting: {
    gap: theme.spacing.sm,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingText: {
    gap: theme.spacing.xxs,
    flex: 1,
    minWidth: 0,
  },
  banner: {
    borderRadius: theme.radius.lg,
  },
  bannerContent: {
    gap: theme.spacing.sm,
  },
  bannerProgress: {
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  sectionTitle: {
    flex: 1,
    minWidth: 0,
  },
  sectionAction: {
    flexShrink: 0,
  },
  institutionPanelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  list: {
    gap: theme.spacing.sm,
  },
  donationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  donationIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.light.secondarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donationInfo: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  donationMeta: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  donationStatus: {
    maxWidth: 96,
  },
  campaignCard: {
    gap: theme.spacing.sm,
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  campaignInfo: {
    gap: theme.spacing.xxs,
    flex: 1,
    minWidth: 0,
  },
  campaignMeta: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  adminInstitution: {
    gap: theme.spacing.md,
  },
  adminInstitutionInfo: {
    gap: theme.spacing.xxs,
  },
  adminActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'flex-end',
  },
  bold: {
    fontWeight: '600',
  },
  // kept for grid usage
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metric: {
    flexBasis: '47%',
    gap: theme.spacing.xs,
  },
  chartCard: {
    gap: theme.spacing.lg,
  },
  chartBars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    height: 112,
  },
  chartBar: {
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
    flex: 1,
  },
  accountabilityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  header: {
    gap: theme.spacing.sm,
  },
});
