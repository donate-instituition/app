import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Redirect, Tabs } from 'expo-router';

import { FloatingTabBar } from '@/components/floating-tab-bar';
import { useChatUnread } from '@/hooks/use-chat-unread';
import { getHomeRouteForRole } from '@/navigation/routes';
import { type UserRole } from '@/navigation/session';
import { useActiveRole } from '@/store';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type TabConfig = {
  name: string;
  title: string;
  icon: IoniconName;
  activeIcon: IoniconName;
  badge?: number;
};

type RoleTabsLayoutProps = {
  tabs: TabConfig[];
  expectedRole: UserRole;
};

function RoleFloatingTabBar({
  descriptors,
  navigation,
  state,
  tabs,
}: BottomTabBarProps & { tabs: TabConfig[] }) {
  const items = state.routes.map((route, index) => {
    const options = descriptors[route.key]?.options;
    const focused = state.index === index;
    const configuredTab = tabs.find((item) => item.name === route.name);

    return {
      activeIcon: configuredTab?.activeIcon ?? 'ellipse',
      badge: typeof options?.tabBarBadge === 'number' ? options.tabBarBadge : undefined,
      icon: configuredTab?.icon ?? 'ellipse-outline',
      key: route.name,
      label: String(options?.title ?? route.name),
      onPress: () => {
        const event = navigation.emit({
          canPreventDefault: true,
          target: route.key,
          type: 'tabPress',
        });

        if (!focused && !event.defaultPrevented) {
          navigation.navigate(route.name, route.params);
        }
      },
    };
  });

  const activeRoute = state.routes[state.index];

  return <FloatingTabBar activeKey={activeRoute?.name ?? ''} items={items} />;
}

export function RoleTabsLayout({ tabs, expectedRole }: RoleTabsLayoutProps) {
  const activeRole = useActiveRole();

  if (activeRole !== expectedRole) {
    return <Redirect href={getHomeRouteForRole(activeRole)} />;
  }

  return (
    <Tabs
      tabBar={(props) => <RoleFloatingTabBar {...props} tabs={tabs} />}
      screenOptions={{
        headerShown: false,
        tabBarAllowFontScaling: false,
        tabBarHideOnKeyboard: true,
      }}>
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarBadge: tab.badge && tab.badge > 0 ? tab.badge : undefined,
          }}
        />
      ))}
    </Tabs>
  );
}

export function DonorTabsLayout() {
  const unreadCount = useChatUnread();

  return (
    <RoleTabsLayout
      expectedRole="donor"
      tabs={[
        { name: 'dashboard', title: 'Início', icon: 'home-outline', activeIcon: 'home' },
        { name: 'campaigns', title: 'Explorar', icon: 'compass-outline', activeIcon: 'compass' },
        { name: 'donations', title: 'Doar', icon: 'heart-outline', activeIcon: 'heart' },
        { name: 'messages', title: 'Conversas', icon: 'chatbubble-outline', activeIcon: 'chatbubble', badge: unreadCount },
        { name: 'profile', title: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
      ]}
    />
  );
}

export function InstitutionTabsLayout() {
  const unreadCount = useChatUnread();

  return (
    <RoleTabsLayout
      expectedRole="institution-staff"
      tabs={[
        { name: 'dashboard', title: 'Painel', icon: 'grid-outline', activeIcon: 'grid' },
        { name: 'campaigns', title: 'Campanhas', icon: 'megaphone-outline', activeIcon: 'megaphone' },
        { name: 'create', title: 'Criar', icon: 'add', activeIcon: 'add' },
        { name: 'messages', title: 'Conversas', icon: 'chatbubble-outline', activeIcon: 'chatbubble', badge: unreadCount },
        { name: 'profile', title: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
      ]}
    />
  );
}

export function AdminTabsLayout() {
  return (
    <RoleTabsLayout
      expectedRole="platform-admin"
      tabs={[
        { name: 'dashboard', title: 'Dashboard', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
        { name: 'institutions', title: 'Instituições', icon: 'business-outline', activeIcon: 'business' },
        { name: 'users', title: 'Usuários', icon: 'people-outline', activeIcon: 'people' },
        { name: 'audit', title: 'Auditoria', icon: 'shield-outline', activeIcon: 'shield' },
        { name: 'profile', title: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
      ]}
    />
  );
}
