import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { styles } from './styles';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export type FloatingTabItem = {
  activeIcon?: IoniconName;
  badge?: number;
  icon: IoniconName;
  key: string;
  label: string;
  onPress?: () => void;
};

type FloatingTabBarProps = {
  activeKey: string;
  items: readonly FloatingTabItem[];
};

export function FloatingTabBar({ activeKey, items }: FloatingTabBarProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      {items.map((item) => {
        const active = item.key === activeKey;

        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.item,
              pressed && styles.pressedItem,
            ]}>
            <View style={active ? [styles.activeIcon, { backgroundColor: colors.primary }] : styles.inactiveIcon}>
              <Ionicons
                name={active ? item.activeIcon ?? item.icon : item.icon}
                size={active ? 24 : 21}
                color={active ? colors.surface : colors.textMuted}
              />
              {item.badge && item.badge > 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <ThemedText variant="caption" style={styles.badgeText}>
                    {item.badge > 9 ? '9+' : item.badge}
                  </ThemedText>
                </View>
              ) : null}
            </View>
            <ThemedText
              variant="caption"
              color={active ? colors.primary : colors.textMuted}
              style={styles.label}>
              {item.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
