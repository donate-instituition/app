import { Redirect, Stack } from 'expo-router';

import { getHomeRouteForRole } from '@/navigation/routes';
import { useActiveRole, useAppStore } from '@/store';

export default function AuthLayout() {
  const authToken = useAppStore((state) => state.authToken);
  const activeRole = useActiveRole();

  if (authToken) {
    return <Redirect href={getHomeRouteForRole(activeRole)} />;
  }

  return (
    <Stack>
      <Stack.Screen name="access" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="activate-account" options={{ headerShown: false }} />
    </Stack>
  );
}
