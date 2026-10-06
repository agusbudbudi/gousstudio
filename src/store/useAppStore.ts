import { create } from 'zustand';

interface AppState {
  isOrderModalOpen: boolean;
  prefillData: any;
  openOrderModal: (data?: any) => void;
  closeOrderModal: () => void;
}

export const useAppStore = create<AppState>((set) => ({
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
      category: "Lainnya",
      deliverables: ["Sesuai diskusi"],
    };

    set({
      isOrderModalOpen: true,
      prefillData: actualData ?? defaultCustomPackage,
    });
  },
  
  closeOrderModal: () => set({ isOrderModalOpen: false, prefillData: null }),
}));
