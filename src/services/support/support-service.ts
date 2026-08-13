import { api } from '@/services/api';

import type { SupportFaq } from './support-types';

async function getCurrentFaq() {
  return api.get<SupportFaq>('/support-faqs/current');
}

export const supportService = {
  getCurrentFaq,
};
