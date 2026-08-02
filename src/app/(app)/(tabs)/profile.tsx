import { Redirect } from 'expo-router';

import { routes } from '@/navigation/routes';
import { useActiveRole } from '@/store';

export default function LegacyProfileRoute() {
  const activeRole = useActiveRole();

  const href =
    activeRole === 'platform-admin'
      ? routes.adminProfile
      : activeRole === 'institution-staff'
        ? routes.institutionProfile
        : routes.donorProfile;

  return <Redirect href={href} />;
}
