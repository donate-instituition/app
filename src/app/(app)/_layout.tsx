import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { routes } from '@/navigation/routes';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type TabConfig = {
  title: string;
  icon: IoniconName;
  activeIcon: IoniconName;
};

function getDonorTabs(): Record<string, TabConfig> {
  return {
    dashboard: { title: 'Início', icon: 'home-outline', activeIcon: 'home' },
    campaigns: { title: 'Busca', icon: 'search-outline', activeIcon: 'search' },
    donations: { title: 'Doações', icon: 'heart-outline', activeIcon: 'heart' },
    messages: { title: 'Chat', icon: 'chatbubble-outline', activeIcon: 'chatbubble' },
    profile: { title: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
  };
}

function getInstitutionTabs(): Record<string, TabConfig> {
  return {
    dashboard: { title: 'Painel', icon: 'grid-outline', activeIcon: 'grid' },
    campaigns: { title: 'Campanhas', icon: 'megaphone-outline', activeIcon: 'megaphone' },
    donations: { title: 'Doações', icon: 'heart-outline', activeIcon: 'heart' },
    messages: { title: 'Chat', icon: 'chatbubble-outline', activeIcon: 'chatbubble' },
    profile: { title: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
  };
}

function getAdminTabs(): Record<string, TabConfig> {
  return {
    dashboard: { title: 'Dashboard', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
    campaigns: { title: 'Instituições', icon: 'business-outline', activeIcon: 'business' },
    donations: { title: 'Usuários', icon: 'people-outline', activeIcon: 'people' },
    messages: { title: 'Auditoria', icon: 'shield-outline', activeIcon: 'shield' },
    profile: { title: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
  };
}

export default function AppLayout() {
  const authToken = useAppStore((state) => state.authToken);
  const user = useAppStore((state) => state.user);
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  if (!authToken || !user) {
    return <Redirect href={routes.authLogin} />;
  }

  const tabs =
    user.role === 'platform-admin'
      ? getAdminTabs()
      : user.role === 'institution-staff'
        ? getInstitutionTabs()
        : getDonorTabs();

  const tabNames = ['dashboard', 'campaigns', 'donations', 'messages', 'profile'] as const;

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
      {tabNames.map((name) => {
        const tab = tabs[name];
        return (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title: tab.title,
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? tab.activeIcon : tab.icon}
                  color={color}
                  size={size}
                />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}

