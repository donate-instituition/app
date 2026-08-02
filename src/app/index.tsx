import { Redirect } from 'expo-router';

import { getHomeRouteForRole, routes } from '@/navigation/routes';
import { useActiveRole, useAppStore } from '@/store';

export default function IndexRoute() {
  const authToken = useAppStore((state) => state.authToken);
  const activeRole = useActiveRole();

  return <Redirect href={authToken ? getHomeRouteForRole(activeRole) : routes.authLogin} />;
}
