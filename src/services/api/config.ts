import { environments } from '@/config/environments';

export const API_BASE_URL = environments.returnBaseUrl();

export const API_TIMEOUT_MS = 15000;
