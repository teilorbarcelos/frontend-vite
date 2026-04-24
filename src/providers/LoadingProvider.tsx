import { useLoadingStore } from '@/stores/loading';
import { Loader2 } from 'lucide-react';
import React from 'react';

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, message } = useLoadingStore();

  return (
    <>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm transition-all animate-in fade-in">
          <div className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-2xl border border-gray-100">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-700 font-medium">{message}</p>
          </div>
        </div>
      )}
    </>
  );
}
