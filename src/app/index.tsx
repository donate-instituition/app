import { Redirect } from 'expo-router';

import { routes } from '@/navigation/routes';
import { useAppStore } from '@/store';

export default function IndexRoute() {
  const authToken = useAppStore((state) => state.authToken);

  return <Redirect href={authToken ? routes.appDashboard : routes.authLogin} />;
}
