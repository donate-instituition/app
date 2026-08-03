import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    bottom: 14,
    flexDirection: 'row',
    height: 70,
    justifyContent: 'space-around',
    left: 18,
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    position: 'absolute',
    right: 18,
    shadowColor: '#102A24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 8,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.xs,
  },
  inactiveIcon: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 44,
  },
  activeIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 52,
    justifyContent: 'center',
    marginTop: -28,
    width: 52,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
