import { API_ENDPOINTS } from '@/constants';
import { apiRequest } from '@/api/client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

export const authApi = {
  login: (payload: LoginRequest) =>
    apiRequest<AuthResponse>(API_ENDPOINTS.auth.login, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  register: (payload: RegisterRequest) =>
    apiRequest<AuthResponse>(API_ENDPOINTS.auth.register, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: () =>
    apiRequest<{ user: AuthResponse['user'] }>(API_ENDPOINTS.auth.me, {
      method: 'GET',
    }),
};
