import { useAuthStore } from '@/stores/auth';

export function useAuth() {
  const store = useAuthStore();
  return store;
}

export type { User, Permission } from '@/stores/auth';
