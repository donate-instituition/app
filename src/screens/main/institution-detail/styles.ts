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
    overflow: 'hidden',
  },
  coverImage: {
    height: '100%',
    width: '100%',
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
  mapCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 112,
  },
  mapPreview: {
    borderRadius: 18,
    height: 82,
    overflow: 'hidden',
    position: 'relative',
    width: 102,
  },
  mapRoad: {
    borderRadius: theme.radius.pill,
    height: 14,
    opacity: 0.62,
    position: 'absolute',
  },
  mapRoadPrimary: {
    left: -12,
    top: 22,
    transform: [{ rotate: '-18deg' }],
    width: 136,
  },
  mapRoadSecondary: {
    bottom: 18,
    right: -18,
    transform: [{ rotate: '28deg' }],
    width: 118,
  },
  mapPin: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 42,
    justifyContent: 'center',
    left: 30,
    position: 'absolute',
    top: 20,
    width: 42,
  },
  mapInfo: {
    flex: 1,
    gap: theme.spacing.xs,
    minWidth: 0,
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
    alignSelf: 'stretch',
    width: '100%',
  },
  adminPanel: {
    gap: theme.spacing.md,
  },
  adminPanelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  adminIconCircle: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  adminPanelText: {
    flex: 1,
    gap: theme.spacing.xxs,
    minWidth: 0,
  },
  adminStatusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  adminStatusItem: {
    borderColor: theme.colors.light.border,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexBasis: '47%',
    flexGrow: 1,
    gap: theme.spacing.xs,
    minHeight: 72,
    padding: theme.spacing.sm,
  },
});
