import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
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
});
