export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const getApiUrl = (path: string) => `${BASE_URL}${path}`;

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
