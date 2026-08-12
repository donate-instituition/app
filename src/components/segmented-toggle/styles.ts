import { StyleSheet } from 'react-native';

import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    minHeight: 58,
    padding: 4,
    position: 'relative',
  },
  indicator: {
    borderRadius: theme.radius.pill,
    bottom: 4,
    left: 0,
    position: 'absolute',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    top: 4,
  },
  segment: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    zIndex: 1,
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
