import { Redirect } from 'expo-router';

import { routes } from '@/navigation/routes';
import { useActiveRole } from '@/store';

export default function LegacyCampaignsRoute() {
  const activeRole = useActiveRole();

  if (activeRole === 'platform-admin') return <Redirect href={routes.adminInstitutions} />;
  if (activeRole === 'institution-staff') return <Redirect href={routes.institutionCampaigns} />;
  return <Redirect href={routes.donorCampaigns} />;
}
