import { useToastStore } from '@/stores/toast';

export function useToast() {
  const store = useToastStore();
  return store;
}

export type { Toast } from '@/stores/toast';
