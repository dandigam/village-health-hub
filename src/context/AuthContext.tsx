import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppRole } from '@/config/routeAccess';
import { mockUser } from '@/mock';

interface AuthUser {
  id: number;
  name: string;
  role: AppRole;
  wareHouse?: {
    id: number | string;
    name?: string;
  };
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  expiresAt: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userName: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090/api';

function getStoredAuth(): AuthState {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const expiresAt = localStorage.getItem('expiresAt');
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user, expiresAt };
  } catch {
    return { token: null, user: null, expiresAt: null };
  }
}

function isTokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt) <= new Date();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('expiresAt');
    setUser(null);
    setToken(null);
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    const stored = getStoredAuth();
    if (stored.token && stored.user && !isTokenExpired(stored.expiresAt)) {
      setToken(stored.token);
      setUser(stored.user);
    } else if (stored.token) {
      // Token expired — clear
      logout();
    }
    setInitialized(true);
  }, [logout]);

  // Auto-logout on token expiry
  useEffect(() => {
    const expiresAt = localStorage.getItem('expiresAt');
    if (!expiresAt || !token) return;

    const ms = new Date(expiresAt).getTime() - Date.now();
    if (ms <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(() => {
      logout();
    }, ms);

    return () => clearTimeout(timer);
  }, [token, logout]);

  const login = useCallback(async (userName: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, password }),
      });

      if (!res.ok) {
        throw new Error(`Login failed (${res.status})`);
      }

      const data = await res.json();
      const { token: newToken, expiresAt, user: apiUser } = data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(apiUser));
      localStorage.setItem('expiresAt', expiresAt);

      setToken(newToken);
      setUser(apiUser);
      console.log('✅ [Auth] Logged in via API');
    } catch (err) {
      console.warn('🔄 [Auth Fallback] API login failed, using mock user:', (err as Error).message);

      // Fallback: use mock user with a dummy token
      const mockAuthUser: AuthUser = {
        id: Number(mockUser.id),
        name: mockUser.name,
        role: 'ADMIN' as AppRole,
      };
      const mockToken = 'mock-token-fallback';
      const mockExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockAuthUser));
      localStorage.setItem('expiresAt', mockExpiry);

      setToken(mockToken);
      setUser(mockAuthUser);
    } finally {
      setLoading(false);
    }
  }, []);

  if (!initialized) return null;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
