import { get, post, patch } from './api';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  User,
} from './types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return post<AuthResponse>('/auth/login', credentials);
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return post<AuthResponse>('/auth/register', userData);
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return post<AuthResponse>('/auth/refresh', { refreshToken });
  },

  async getCurrentUser(): Promise<User> {
    return get<User>('/auth/me');
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return patch<void>('/auth/change-password', data);
  },

  async logout(): Promise<void> {
    return post<void>('/auth/logout');
  },
};