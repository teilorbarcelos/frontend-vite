import { useLoadingStore } from '@/stores/loading';

export function useLoading() {
  const store = useLoadingStore();
  return store;
}
