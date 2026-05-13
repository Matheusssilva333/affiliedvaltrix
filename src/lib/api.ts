import axios from 'axios';

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined' || !document.cookie) return null;
  const cookiePairs = document.cookie.split(';').map((cookie) => cookie.trim());
  const cookie = cookiePairs.find((pair) => pair.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const isRefreshEndpoint = config.url?.endsWith('/api/auth/refresh');
    const csrfCookieName = isRefreshEndpoint
      ? 'csrf_refresh_token_cookie'
      : 'csrf_access_token_cookie';

    const csrfToken = getCookie(csrfCookieName);
    if (csrfToken) {
      config.headers = {
        ...config.headers,
        'X-CSRF-TOKEN': csrfToken,
      };
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.__isRetryRequest
    ) {
      originalRequest.__isRetryRequest = true;
      try {
        await api.post('/api/auth/refresh');
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
