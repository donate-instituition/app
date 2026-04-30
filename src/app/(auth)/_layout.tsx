import { Redirect, Stack } from 'expo-router';

import { routes } from '@/navigation/routes';
import { useAppStore } from '@/store';

export default function AuthLayout() {
  const authToken = useAppStore((state) => state.authToken);

  if (authToken) {
    return <Redirect href={routes.appDashboard} />;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}
