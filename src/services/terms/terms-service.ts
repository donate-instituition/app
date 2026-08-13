import { api } from '@/services/api';

import type { AcceptCurrentTermsResponse, Term } from './terms-types';

async function getCurrentTerm() {
  return api.get<Term>('/terms/current');
}

async function acceptCurrentTerm(token: string | null) {
  return api.post<AcceptCurrentTermsResponse, undefined>(
    '/terms/accept-current',
    undefined,
    { token },
  );
}

export const termsService = {
  acceptCurrentTerm,
  getCurrentTerm,
};
