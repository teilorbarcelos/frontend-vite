import type { User } from '@/stores/auth';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  email: string | null;
  token: string | null;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface TokenValidationResponse {
  valid: boolean;
}
