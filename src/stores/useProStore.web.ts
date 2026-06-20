import { create } from 'zustand';

// Web override of the Pro store. There is no in-browser IAP (react-native-purchases
// has no web SDK) and the web app exists to grow the user base outside the App
// Store, so every web user gets the full ("Pro") feature set for free. isPro is
// hard-true; activate/deactivate are kept for API parity but cannot turn Pro off.
interface ProState {
  isPro: boolean;
  purchasedAt: string | null;
  hasHydrated: boolean;
  activate: () => void;
  deactivate: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useProStore = create<ProState>()((set) => ({
  isPro: true,
  purchasedAt: null,
  hasHydrated: true,
  activate: () => set({ isPro: true }),
  deactivate: () => {}, // no-op on web: Pro is always free
  setHasHydrated: (v) => set({ hasHydrated: v }),
}));
