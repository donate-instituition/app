import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

import { useChatUnread } from '@/hooks/use-chat-unread';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getHomeRouteForRole } from '@/navigation/routes';
import { type UserRole } from '@/navigation/session';
import { useActiveRole } from '@/store';
import { theme } from '@/theme';

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

export function RoleTabsLayout({ tabs, expectedRole }: RoleTabsLayoutProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const activeRole = useActiveRole();

  if (activeRole !== expectedRole) {
    return <Redirect href={getHomeRouteForRole(activeRole)} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}>
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarBadge: tab.badge && tab.badge > 0 ? tab.badge : undefined,
            tabBarBadgeStyle: { backgroundColor: colors.primary },
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? tab.activeIcon : tab.icon}
                color={color}
                size={size}
              />
            ),
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
        { name: 'campaigns', title: 'Busca', icon: 'search-outline', activeIcon: 'search' },
        { name: 'donations', title: 'Doações', icon: 'heart-outline', activeIcon: 'heart' },
        { name: 'messages', title: 'Chat', icon: 'chatbubble-outline', activeIcon: 'chatbubble', badge: unreadCount },
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
        { name: 'donations', title: 'Doações', icon: 'heart-outline', activeIcon: 'heart' },
        { name: 'team', title: 'Equipe', icon: 'people-outline', activeIcon: 'people' },
        { name: 'messages', title: 'Chat', icon: 'chatbubble-outline', activeIcon: 'chatbubble', badge: unreadCount },
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
