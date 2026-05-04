import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('env configuration', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should fallback to local if VITE_ENV is unknown', async () => {
    vi.stubEnv('VITE_ENV', 'unknown_env');
    
    // Re-importação para pegar o novo env stub
    const { CONFIG } = await import('../env');
    
    expect(CONFIG.ENV).toBe('unknown_env');
    expect(CONFIG.API_URL).toBe('http://localhost:8888');
    
    vi.unstubAllEnvs();
  });

  it('should default to local if VITE_ENV is not provided', async () => {
    vi.stubEnv('VITE_ENV', '');
    
    // Reset modules para garantir reavaliação
    vi.resetModules();
    const { CONFIG } = await import('../env');
    
    expect(CONFIG.ENV).toBe('local');
    expect(CONFIG.API_URL).toBe('http://localhost:8888');
    
    vi.unstubAllEnvs();
  });
});
