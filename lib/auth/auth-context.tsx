'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types/auth';
import { DEMO_USERS } from './mock-users';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickLogin: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sicologia_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading session from localStorage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Simulate brief network latency for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 400));

    const normalizedEmail = email.trim().toLowerCase();
    const foundUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    if (!foundUser) {
      setIsLoading(false);
      return { success: false, error: 'Credenciales inválidas. Verifica tu correo y contraseña.' };
    }

    if (!foundUser.activo) {
      setIsLoading(false);
      return { success: false, error: 'Esta cuenta se encuentra temporalmente inactiva. Contacta al Administrador.' };
    }

    const { password: _, ...profile } = foundUser;
    setUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    setIsLoading(false);

    if (profile.rol === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/clinico');
    }

    return { success: true };
  };

  const quickLogin = (userId: string) => {
    const foundUser = DEMO_USERS.find((u) => u.id === userId);
    if (foundUser) {
      const { password: _, ...profile } = foundUser;
      setUser(profile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      if (profile.rol === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/clinico');
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, quickLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
