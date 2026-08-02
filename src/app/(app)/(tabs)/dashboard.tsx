import { Redirect } from 'expo-router';

import { getHomeRouteForRole } from '@/navigation/routes';
import { useActiveRole } from '@/store';

export default function LegacyDashboardRoute() {
  const activeRole = useActiveRole();

  return <Redirect href={getHomeRouteForRole(activeRole)} />;
}
