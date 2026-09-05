import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { api, readStoredAuth, writeStoredAuth } from '../api/client';

export type CurrentUser = {
  id: string;
  email: string;
  full_name: string;
  organization_id: string;
  organization?: { id: string; name: string; base_currency: string } | null;
  employee_id?: string | null;
  employee?: { id: string; employee_number: string; first_name: string; last_name: string } | null;
  is_active: boolean;
  roles: string[];
  permissions: string[];
};

type AuthContextValue = {
  user: CurrentUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (perm: string) => boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMe = useCallback(async () => {
    const auth = readStoredAuth();
    if (!auth?.access_token) {
      setUser(null);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data as CurrentUser);
    } catch {
      writeStoredAuth(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchMe();
      setLoading(false);
    })();
  }, [fetchMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post('/auth/login', { email, password });
      const payload = res.data.data;
      writeStoredAuth(payload.tokens);
      setUser(payload.user as CurrentUser);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    writeStoredAuth(null);
    setUser(null);
  }, []);

  const hasRole = useCallback((role: string) => !!user?.roles?.includes(role), [user]);
  const hasPermission = useCallback(
    (perm: string) => !!(user?.roles?.includes('admin') || user?.permissions?.includes(perm)),
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, logout, hasRole, hasPermission, refresh: fetchMe }),
    [user, loading, login, logout, hasRole, hasPermission, fetchMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
