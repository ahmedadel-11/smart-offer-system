import { apiClient, TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from './api';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  UserDto,
} from '../types';

const AUTH_ENDPOINT = '/auth';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(`${AUTH_ENDPOINT}/login`, data);
    const loginData = response.data;

    // Store tokens
    localStorage.setItem(TOKEN_KEY, loginData.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, loginData.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(loginData.user));

    return loginData;
  },

  async refresh(data: RefreshTokenRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(`${AUTH_ENDPOINT}/refresh`, data);
    const loginData = response.data;

    localStorage.setItem(TOKEN_KEY, loginData.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, loginData.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(loginData.user));

    return loginData;
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post(`${AUTH_ENDPOINT}/change-password`, data);
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiClient.post(`${AUTH_ENDPOINT}/reset-password`, data);
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(`${AUTH_ENDPOINT}/logout`);
    } finally {
      this.clearTokens();
    }
  },

  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getStoredUser(): UserDto | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr) as UserDto;
      } catch {
        return null;
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  },
};

export default authService;
