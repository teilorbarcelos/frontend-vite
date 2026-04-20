import { LoadingContext } from '@/hooks/useLoading';
import { Loader2 } from 'lucide-react';
import React, { useCallback, useState } from 'react';

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('Carregando...');

  const showLoading = useCallback((msg?: string) => {
    setMessage(msg || 'Carregando...');
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm transition-all animate-in fade-in">
          <div className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-2xl border border-gray-100">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-700 font-medium">{message}</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}
