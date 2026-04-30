import { create } from 'zustand';

import type { SessionUser, UserRole } from '@/navigation/session';

type AppStore = {
  authToken: string | null;
  user: SessionUser | null;
  selectedCampaignId: string | null;
  loginAs: (role: UserRole) => void;
  logout: () => void;
  selectCampaign: (campaignId: string | null) => void;
  reset: () => void;
};

const initialState = {
  authToken: null,
  user: null,
  selectedCampaignId: null,
};

const mockUsers: Record<UserRole, SessionUser> = {
  'platform-admin': {
    id: 'admin-platform-1',
    name: 'Ana Administradora',
    email: 'admin@elodoar.com',
    role: 'platform-admin',
  },
  donor: {
    id: 'donor-1',
    name: 'Joao da Silva',
    email: 'joao@email.com',
    role: 'donor',
  },
  'institution-staff': {
    id: 'institution-staff-1',
    name: 'Carlos Lima',
    email: 'carlos@instituicao.org',
    role: 'institution-staff',
    institutionRole: 'admin',
  },
};

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,
  loginAs: (role) =>
    set({
      authToken: `mock-token-${role}`,
      user: mockUsers[role],
    }),
  logout: () => set(initialState),
  selectCampaign: (selectedCampaignId) => set({ selectedCampaignId }),
  reset: () => set(initialState),
}));
