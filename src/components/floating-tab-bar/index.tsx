import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/theme';

import { styles } from './styles';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export type FloatingTabItem = {
  activeIcon?: IoniconName;
  icon: IoniconName;
  key: string;
  label: string;
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
          <View key={item.key} style={styles.item}>
            <View style={active ? [styles.activeIcon, { backgroundColor: colors.primary }] : styles.inactiveIcon}>
              <Ionicons
                name={active ? item.activeIcon ?? item.icon : item.icon}
                size={active ? 24 : 21}
                color={active ? colors.surface : colors.textMuted}
              />
            </View>
            <ThemedText
              variant="caption"
              color={active ? colors.primary : colors.textMuted}
              style={styles.label}>
              {item.label}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}
