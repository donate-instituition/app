import { Redirect } from 'expo-router';

import { routes } from '@/navigation/routes';
import { useActiveRole } from '@/store';

export default function LegacyMessagesRoute() {
  const activeRole = useActiveRole();

  if (activeRole === 'platform-admin') return <Redirect href={routes.adminAudit} />;
  if (activeRole === 'institution-staff') return <Redirect href={routes.institutionMessages} />;
  return <Redirect href={routes.donorMessages} />;
}
