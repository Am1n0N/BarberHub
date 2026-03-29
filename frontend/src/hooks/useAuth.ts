'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import { User } from '@/lib/types';
import { api } from '@/lib/api';

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function useAuth() {
  const user = useSyncExternalStore(subscribe, getStoredUser, () => null);
  const [loading] = useState(false);

  const login = useCallback(async (phone: string, password: string) => {
    const res = await api.login(phone, password);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    window.dispatchEvent(new Event('storage'));
    return res.user;
  }, []);

  const register = useCallback(
    async (data: { phone: string; name: string; password: string; role?: string }) => {
      const res = await api.register(data);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      window.dispatchEvent(new Event('storage'));
      return res.user;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
  }, []);

  return { user, loading, login, register, logout, isAuthenticated: !!user };
}
