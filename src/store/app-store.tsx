import { create } from 'zustand';

type AppStore = {
  authToken: string | null;
  selectedCampaignId: string | null;
  setAuthToken: (token: string | null) => void;
  selectCampaign: (campaignId: string | null) => void;
  reset: () => void;
};

const initialState = {
  authToken: null,
  selectedCampaignId: null,
};

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,
  setAuthToken: (authToken) => set({ authToken }),
  selectCampaign: (selectedCampaignId) => set({ selectedCampaignId }),
  reset: () => set(initialState),
}));
