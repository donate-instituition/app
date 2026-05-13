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
  },
  donationMeta: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    alignItems: 'center',
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
  },
  campaignMeta: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
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
  header: {
    gap: theme.spacing.sm,
  },
});

