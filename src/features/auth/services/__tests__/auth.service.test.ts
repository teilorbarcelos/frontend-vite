import { api } from '@/lib/axios';
import { describe, expect, it, vi } from 'vitest';
import { authService } from '../auth.service';

vi.mock('@/lib/axios', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('authService', () => {
  it('login calls correct endpoint', async () => {
    const data = { email: 'test@test.com', password: 'password' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: { token: 'tok' } });
    
    await authService.login(data);
    expect(api.post).toHaveBeenCalledWith('/v1/auth/login', data);
  });

  it('requestPasswordReset calls correct endpoint', async () => {
    const email = 'test@test.com';
    vi.mocked(api.post).mockResolvedValueOnce({ data: { message: 'sent' } });
    
    await authService.requestPasswordReset(email);
    expect(api.post).toHaveBeenCalledWith('/v1/auth/password/request', { email });
  });

  it('validateResetToken calls correct endpoint', async () => {
    const email = 'test@test.com';
    const token = 'token123';
    vi.mocked(api.post).mockResolvedValueOnce({ data: { valid: true } });
    
    await authService.validateResetToken(email, token);
    expect(api.post).toHaveBeenCalledWith('/v1/auth/password/validate', { email, token });
  });

  it('resetPassword calls correct endpoint', async () => {
    const data = { email: 'test@test.com', token: 'tok', password: 'new' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: { message: 'changed' } });
    
    await authService.resetPassword(data);
    expect(api.post).toHaveBeenCalledWith('/v1/auth/password/change', data);
  });
});
