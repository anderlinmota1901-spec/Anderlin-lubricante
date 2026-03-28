'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'anderlin-auth-user';

const AuthContext = createContext(null);

const readStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === 'object' && parsed.username) {
      return { username: String(parsed.username) };
    }
  } catch (error) {
    console.warn('No se pudo leer la sesión almacenada', error);
  }
  return null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());

  useEffect(() => {
    // Garantiza hidratación si la sesión cambia fuera del hook inicial
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: user.username }));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (username, password) => {
    if (username === 'anderlinmota1901@gmail.com' && password === '12345678_@@') {
      setUser({ username });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(() => ({ user, isAuthenticated: !!user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
