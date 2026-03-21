import { create } from 'zustand';
import { CONFIG } from '../config/constants';

export const useAppStore = create((set) => ({
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
    set({ isOrderModalOpen: true, prefillData: actualData });
  },
  
  closeOrderModal: () => set({ isOrderModalOpen: false, prefillData: null }),
}));
