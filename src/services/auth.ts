import * as SecureStore from 'expo-secure-store';

export interface AuthUser { id: number; name: string | null; email: string | null }
export interface AuthSession { token: string; expiresAt: string; user: AuthUser }
export class AuthError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
const TOKEN_KEY = 'sankalpam.mobile.session';
export const tokenStore = {
  read: () => SecureStore.getItemAsync(TOKEN_KEY),
  write: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }),
  clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};

async function request<T>(path: string, token?: string, body?: object): Promise<T> {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (!base) throw new Error('Authentication is not configured yet.');
  const url = new URL(base);
  if (url.username || url.password || (!__DEV__ && url.protocol !== 'https:') || !['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Configure a secure backend address without credentials.');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${base.replace(/\/+$/, '')}/api/mobile/auth/${path}`, {
      method: path === 'me' ? 'GET' : 'POST',
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) throw new AuthError(typeof data.error === 'string' ? data.error : 'Authentication failed. Please try again.', response.status);
    return data as T;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new Error('Unable to reach authentication. Check your connection and try again.');
  } finally { clearTimeout(timeout); }
}

export const authApi = {
  signin: (email: string, password: string) => request<AuthSession>('signin', undefined, { email, password }),
  signup: (email: string, password: string, name: string) => request<AuthSession>('signup', undefined, { email, password, name }),
  me: (token: string) => request<{ user: AuthUser }>('me', token),
  signout: (token: string) => request<{ success: boolean }>('signout', token),
};
