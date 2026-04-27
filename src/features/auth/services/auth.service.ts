import { api } from '@/lib/axios';
import type { AuthResponse, LoginPayload, ResetPasswordPayload, TokenValidationResponse } from '../types/auth.types';

export const authService = {
  async login(data: LoginPayload): Promise<AuthResponse> {
    const response = await api.post('/v1/auth/login', data);
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await api.post('/v1/auth/password/request', { email });
    return response.data;
  },

  async validateResetToken(email: string, token: string): Promise<TokenValidationResponse> {
    const response = await api.post('/v1/auth/password/validate', { email, token });
    return response.data;
  },

  async resetPassword(data: ResetPasswordPayload): Promise<{ message: string }> {
    const response = await api.post('/v1/auth/password/change', data);
    return response.data;
  }
};
