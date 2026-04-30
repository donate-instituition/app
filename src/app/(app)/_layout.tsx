import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { routes } from '@/navigation/routes';
import { roleHomeLabels } from '@/navigation/session';
import { useAppStore } from '@/store';
import { theme } from '@/theme';

export default function AppLayout() {
  const authToken = useAppStore((state) => state.authToken);
  const user = useAppStore((state) => state.user);
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];

  if (!authToken || !user) {
    return <Redirect href={routes.authLogin} />;
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
      <Tabs.Screen
        name="dashboard"
        options={{
          title: roleHomeLabels[user.role],
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="campaigns"
        options={{
          title: user.role === 'platform-admin' ? 'Instituicoes' : 'Campanhas',
          tabBarIcon: ({ color, size }) => <Ionicons name="megaphone-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="donations"
        options={{
          title: user.role === 'platform-admin' ? 'Usuarios' : 'Doacoes',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: user.role === 'platform-admin' ? 'Auditoria' : 'Chat',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
