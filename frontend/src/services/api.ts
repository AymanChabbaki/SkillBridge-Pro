import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../state/store';
import { logout, refreshToken } from '../state/slices/authSlice';
import { ApiResponse } from './types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { auth } = store.getState();
    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        await store.dispatch(refreshToken());
        
        // Retry the original request with new token
        const { auth } = store.getState();
        if (auth.token) {
          originalRequest.headers.Authorization = `Bearer ${auth.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        store.dispatch(logout());
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Generic API request wrapper
export const apiRequest = async <T = any>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await api.request<ApiResponse<T>>(config);
    
    if (response.data.success) {
      return response.data.data as T;
    } else {
      throw new Error(response.data.error?.message || 'API request failed');
    }
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error.message);
    }
    throw error;
  }
};

// HTTP method helpers
export const get = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  apiRequest<T>({ method: 'GET', url, ...config });

export const post = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> =>
  apiRequest<T>({ method: 'POST', url, data, ...config });

export const put = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> =>
  apiRequest<T>({ method: 'PUT', url, data, ...config });

export const patch = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> =>
  apiRequest<T>({ method: 'PATCH', url, data, ...config });

export const del = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  apiRequest<T>({ method: 'DELETE', url, ...config });

export default api;