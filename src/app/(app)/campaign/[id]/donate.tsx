import { Redirect } from 'expo-router';

import { getHomeRouteForRole } from '@/navigation/routes';
import { DonateScreen } from '@/screens/main/donate';
import { useActiveRole } from '@/store';

export default function DonateRoute() {
  const activeRole = useActiveRole();

  if (activeRole !== 'donor') {
    return <Redirect href={getHomeRouteForRole(activeRole)} />;
  }

  return <DonateScreen />;
}
