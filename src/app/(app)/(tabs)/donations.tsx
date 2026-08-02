import { Redirect } from 'expo-router';

import { routes } from '@/navigation/routes';
import { useActiveRole } from '@/store';

export default function LegacyDonationsRoute() {
  const activeRole = useActiveRole();

  if (activeRole === 'platform-admin') return <Redirect href={routes.adminUsers} />;
  if (activeRole === 'institution-staff') return <Redirect href={routes.institutionDonations} />;
  return <Redirect href={routes.donorDonations} />;
}
