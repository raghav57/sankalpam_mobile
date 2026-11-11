import { AppState } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { authApi, AuthError, tokenStore, type AuthSession, type AuthUser } from '@/services/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  signout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);
  const version = useRef(0);
  const invalidate = useCallback(() => { version.current++; }, []);

  const refresh = useCallback(async () => {
    if (locked.current) return;
    const current = ++version.current;
    setLoading(true);
    setError(null);
    try {
      const token = await tokenStore.read();
      const result = token ? await authApi.me(token) : null;
      if (current === version.current) setUser(result?.user ?? null);
    } catch (cause) {
      if (current !== version.current) return;
      if (cause instanceof AuthError && cause.status === 401) {
        setUser(null);
        try { await tokenStore.clear(); }
        catch { setError('Unable to clear the expired session. Please try again.'); }
      } else {
        // Keep the stored token on transient failures; never assume it is valid offline.
        setUser(null);
        setError('Unable to verify your session. Check your connection and retry.');
      }
    } finally { if (current === version.current) setLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => { if (active) return refresh(); });
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') void refresh(); });
    return () => { active = false; invalidate(); subscription.remove(); };
  }, [refresh, invalidate]);

  async function run(action: () => Promise<void>) {
    if (locked.current) throw new Error('Please wait for the current request.');
    locked.current = true;
    version.current++;
    setLoading(false);
    setBusy(true);
    setError(null);
    try { await action(); }
    finally { locked.current = false; setBusy(false); }
  }

  async function accept(session: AuthSession) {
    try { await tokenStore.write(session.token); }
    catch {
      // Avoid leaving an issued session active when secure persistence fails.
      await authApi.signout(session.token).catch(() => undefined);
      throw new Error('Unable to save your session securely. Please try again.');
    }
    setUser(session.user);
  }

  return (
    <AuthContext.Provider value={{ user, loading, busy, error, refresh,
      signin: (email, password) => run(async () => accept(await authApi.signin(email, password))),
      signup: (email, password, name) => run(async () => accept(await authApi.signup(email, password, name))),
      signout: () => run(async () => {
        const token = await tokenStore.read();
        // Do not report success or discard the token until server revocation succeeds.
        if (token) await authApi.signout(token);
        await tokenStore.clear();
        setUser(null);
      }),
    }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth requires AuthProvider.');
  return context;
}
