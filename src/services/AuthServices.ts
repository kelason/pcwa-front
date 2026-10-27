import { getApiBaseUrl } from '../../api';
import { clearSession, getAccessToken, getSessionUser, setSession, type SessionUser } from '../lib/authToken';
import { formatApiError } from '../lib/apiError';

export type { SessionUser };

export const AuthServices = {
  getToken: getAccessToken,
  getUser: getSessionUser,
  isAuthenticated: (): boolean => Boolean(getAccessToken()),

  login: async (email: string, password: string): Promise<SessionUser> => {
    const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(formatApiError(body));
    }
    const data = (await response.json()) as { access_token: string; user: SessionUser };
    setSession(data.access_token, data.user);
    return data.user;
  },

  logout: (): void => clearSession(),
};
