import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import {
  getActiveRole,
  getPreferredInitialRole,
  normalizeSessionUser,
  userCanUseRole,
  type SessionUser,
  type UserRole,
} from '@/navigation/session';
import { persistStorage } from '@/services/storage';


type AppStore = {
  authToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
  activeRole: UserRole | null;
  selectedCampaignId: string | null;
  setSession: (accessToken: string, user: SessionUser, refreshToken?: string) => void;
  setTokens: (accessToken: string, refreshToken?: string | null) => void;
  setActiveRole: (role: UserRole) => void;
  setPreferredRole: (role: UserRole) => void;
  logout: () => void;
  selectCampaign: (campaignId: string | null) => void;
  reset: () => void;
};

const initialState = {
  authToken: null,
  refreshToken: null,
  user: null,
  activeRole: null,
  selectedCampaignId: null,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: (accessToken, user, refreshToken) => {
        const normalizedUser = normalizeSessionUser(user);

        set({
          authToken: accessToken,
          user: normalizedUser,
          activeRole: getPreferredInitialRole(normalizedUser),
          refreshToken: refreshToken ?? null,
        });
      },
      setTokens: (accessToken, refreshToken) => set({ authToken: accessToken, refreshToken: refreshToken ?? null }),
      setActiveRole: (role) =>
        set((state) => {
          if (!state.user || !userCanUseRole(state.user, role)) {
            return state;
          }

          return { activeRole: role };
        }),
      setPreferredRole: (role) =>
        set((state) => {
          if (!state.user || !userCanUseRole(state.user, role)) {
            return state;
          }

          return { user: { ...state.user, preferredRole: role } };
        }),
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
        refreshToken: state.refreshToken,
        user: state.user,
        activeRole: state.activeRole,
      }),
    }
  )
);

export function useActiveRole() {
  return useAppStore((state) => getActiveRole(state.user, state.activeRole));
}
