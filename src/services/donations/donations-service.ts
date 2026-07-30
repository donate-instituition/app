/**
 * Donations Service — Mock implementation.
 *
 * When the back-end is ready, replace each method body with the corresponding
 * `api.get/post(...)` call using the authenticated token from the store.
 * The signatures and return types stay identical, so consuming components won't need changes.
 *
 * To test the error state: set SIMULATE_ERROR = true.
 */



import type {
  CreateDonationRequest,
  CreateDonationResponse,
  Donation,
} from './donations-types';

// ─── Dev flags ────────────────────────────────────────────────────────────────
const SIMULATE_ERROR = false;
const MOCK_DELAY_MS = 1000;

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_DONATIONS: Donation[] = [
  {
    id: 'don-1',
    campaignId: '1',
    campaignTitle: 'Material Escolar 2026',
    institutionName: 'Educação Viva',
    amountCents: 8000,
    amountFormatted: 'R$ 80,00',
    status: 'completed',
    createdAt: '2026-04-15T10:00:00Z',
  },
  {
    id: 'don-2',
    campaignId: '2',
    campaignTitle: 'Cestas de Inverno',
    institutionName: 'Lar Aconchego',
    amountCents: 4500,
    amountFormatted: 'R$ 45,00',
    status: 'cancelled',
    createdAt: '2026-04-01T14:30:00Z',
  },
  {
    id: 'don-3',
    campaignId: '3',
    campaignTitle: 'Mutirão de Saúde Comunitária',
    institutionName: 'Saúde Para Todos',
    amountCents: 3000,
    amountFormatted: 'R$ 30,00',
    status: 'processing',
    createdAt: '2026-05-02T09:15:00Z',
  },
  {
    id: 'don-4',
    campaignId: '1',
    campaignTitle: 'Campanha do Agasalho',
    institutionName: 'Instituto Esperança',
    amountCents: 5000,
    amountFormatted: 'R$ 50,00',
    status: 'completed',
    createdAt: '2026-05-10T11:00:00Z',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

let mockDonations = [...MOCK_DONATIONS];

function formatCents(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

// ─── Service ──────────────────────────────────────────────────────────────────

async function listMyDonations(_token: string | null): Promise<Donation[]> {
  await delay(MOCK_DELAY_MS);

  if (SIMULATE_ERROR) {
    throw new Error('Erro simulado: falha ao carregar doações.');
  }

  // TODO: replace with real API call when backend is ready:
  // return api.get<Donation[]>('/me/donations', { token });

  return [...mockDonations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function createDonation(
  body: CreateDonationRequest,
  _token: string | null
): Promise<CreateDonationResponse> {
  await delay(MOCK_DELAY_MS);

  if (SIMULATE_ERROR) {
    throw new Error('Erro simulado: falha ao processar doação.');
  }

  // TODO: replace with real API call when backend is ready:
  // return api.post<CreateDonationResponse, CreateDonationRequest>('/donations', body, { token });

  const newDonation: Donation = {
    id: `don-${Date.now()}`,
    campaignId: body.campaignId,
    campaignTitle: 'Campanha', // real API will return the full title
    institutionName: 'Instituição',
    amountCents: body.amountCents,
    amountFormatted: formatCents(body.amountCents),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  mockDonations = [newDonation, ...mockDonations];

  return { donation: newDonation };
}

export const donationsService = {
  listMyDonations,
  createDonation,
};
