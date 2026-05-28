/**
 * Configuração centralizada da aplicação
 */

const ENV = import.meta.env.VITE_ENV || 'local';

const API_URLS = {
  local: 'http://localhost:8888', // nosonar
  develop: import.meta.env.VITE_API_URL_DEVELOP || 'https://api-dev.example.com', // nosonar
  alfa: import.meta.env.VITE_API_URL_ALFA || 'https://api-alfa.example.com', // nosonar
  beta: import.meta.env.VITE_API_URL_BETA || 'https://api-beta.example.com', // nosonar
  production: import.meta.env.VITE_API_URL_PRODUCTION || 'https://api.example.com', // nosonar
};

export const CONFIG = {
  ENV,
  API_URL: API_URLS[ENV as keyof typeof API_URLS] || API_URLS.local,
  IS_LOCAL: ENV === 'local',
  IS_PRODUCTION: ENV === 'production',
  // Adicione novas configurações aqui no futuro
  APP_NAME: 'Frontend Vite',
  VERSION: '1.0.0',
};
