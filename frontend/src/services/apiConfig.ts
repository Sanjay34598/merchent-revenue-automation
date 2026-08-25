/**
 * Centralized API Base URL resolver for MerchIntell Frontend.
 * Supports cross-origin backend deployments (e.g. Render/Vercel) via VITE_API_BASE_URL,
 * while falling back to relative paths for local development and proxy setups.
 */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export const getApiUrl = (endpoint: string): string => {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
};
