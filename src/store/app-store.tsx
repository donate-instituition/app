import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { SessionUser } from '@/navigation/session';
import { persistStorage } from '@/services/storage';


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

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: (token, user) => set({ authToken: token, user }),
      logout: () => set(initialState),
      selectCampaign: (selectedCampaignId) => set({ selectedCampaignId }),
      reset: () => set(initialState),
    }),
    {
      name: 'elodoar-session',
      storage: createJSONStorage(() => persistStorage),
      // Only persist auth data; selectedCampaignId is navigation state
      partialize: (state) => ({
        authToken: state.authToken,
        user: state.user,
      }),
    }
  )
);
