import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  message: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  message: 'Carregando...',

  showLoading: (message) => set({ 
    isLoading: true, 
    message: message || 'Carregando...' 
  }),

  hideLoading: () => set({ 
    isLoading: false 
  }),
}));
