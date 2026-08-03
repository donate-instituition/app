import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { marginTop: theme.spacing['4xl'] },

  // Back bar
  backBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
  },

  // Scroll
  scroll: {
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.xl,
  },

  // Identity card
  identity: {
    gap: theme.spacing.sm,
  },
  cover: {
    alignItems: 'center',
    height: 148,
    justifyContent: 'center',
  },
  identityAvatar: {
    borderWidth: 4,
    marginLeft: theme.spacing.lg,
    marginTop: -36,
  },
  identityInfo: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    minWidth: 0,
  },
  profileStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing['2xl'],
    paddingVertical: theme.spacing.xs,
  },
  profileActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  profileButton: {
    flex: 1,
  },

  // Sections
  section: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  bold: {
    fontWeight: '600',
  },

  // Info rows (within card)
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },

  // Campaign rows within card
  campaignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  campaignList: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  campaignRowInfo: {
    flex: 1,
    gap: theme.spacing.xs,
    minWidth: 0,
  },
  campaignRowMeta: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },

  // Action bar
  actionBarSpacer: { height: 80 },
  actionBar: {
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionButton: {
    flex: 1,
  },
});
