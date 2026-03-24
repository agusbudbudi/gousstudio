import { create } from 'zustand';
import { CONFIG } from '../config/constants';

interface AppState {
  theme: string;
  toggleTheme: () => void;
  setTheme: (theme: string) => void;
  isOrderModalOpen: boolean;
  prefillData: any;
  openOrderModal: (data?: any) => void;
  closeOrderModal: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Theme State
  theme: localStorage.getItem('theme') || CONFIG.DEFAULT_THEME,
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    return { theme: newTheme };
  }),
  setTheme: (theme) => set({ theme }),

  // Order Modal State
  isOrderModalOpen: false,
  prefillData: null,
  
  openOrderModal: (data = null) => {
    // Prevent React synthetic event object from being used as prefillData
    const actualData = (data && data.nativeEvent) ? null : data;

    // Default behavior for header/CTA buttons that don't pass a pricelist item:
    // auto set order "Kebutuhan Desain" to the single custom package.
    const defaultCustomPackage = {
      serviceName: "Custom Package",
      category: "Other",
      deliverables: ["Sesuai diskusi"],
    };

    set({
      isOrderModalOpen: true,
      prefillData: actualData ?? defaultCustomPackage,
    });
  },
  
  closeOrderModal: () => set({ isOrderModalOpen: false, prefillData: null }),
}));
