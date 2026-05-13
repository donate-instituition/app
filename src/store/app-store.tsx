import { create } from 'zustand';

import type { SessionUser } from '@/navigation/session';

type AppStore = {
  authToken: string | null;
  user: SessionUser | null;
  selectedCampaignId: string | null;
  setSession: (token: string, user: SessionUser) => void;
  logout: () => void;
  selectCampaign: (campaignId: string | null) => void;
  reset: () => void;
};

const initialState = {
  authToken: null,
  user: null,
  selectedCampaignId: null,
};

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,
  setSession: (token, user) => set({ authToken: token, user }),
  logout: () => set(initialState),
  selectCampaign: (selectedCampaignId) => set({ selectedCampaignId }),
  reset: () => set(initialState),
}));
