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
    textAlign: 'center',
  },

  // Scroll
  scroll: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xl,
  },

  // Identity card
  identity: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  identityInfo: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  textCentered: {
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },

  // Sections
  section: {
    gap: theme.spacing.md,
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
  campaignRowInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  campaignRowMeta: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
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
