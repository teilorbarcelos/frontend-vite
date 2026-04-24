import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/react-query'
import './index.css'
import 'react-day-picker/style.css'
import App from './App.tsx'
import { LoadingProvider } from './providers/LoadingProvider'
import { ToastProvider } from './providers/ToastProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </LoadingProvider>
    </QueryClientProvider>
  </StrictMode>,
)
