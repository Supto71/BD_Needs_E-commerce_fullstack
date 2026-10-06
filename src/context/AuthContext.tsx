'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { getSession, signOut as nextAuthSignOut } from 'next-auth/react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isAuthLoading: boolean; // localStorage থেকে user load হওয়া পর্যন্ত true
  login: (identifier: string, pass: string, loginType?: 'ADMIN' | 'CUSTOMER') => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, pass: string, phone: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateAvatar: (avatarUrl: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // শুরুতে loading

  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await getSession();
        if (session && (session as any).user?.dbUser) {
          const dbUser = (session as any).user.dbUser;
          setUser(dbUser);
          localStorage.setItem('bdneeds_user', JSON.stringify(dbUser));
        } else {
          const savedUser = localStorage.getItem('bdneeds_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (e) {
        console.error('Failed to load user', e);
      } finally {
        setIsAuthLoading(false); // localStorage/session check শেষ
      }
    };
    initAuth();
  }, []);

  const login = async (identifier: string, pass: string, loginType?: 'ADMIN' | 'CUSTOMER') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: pass, loginType }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Login failed' };
      }
      setUser(data.user);
      localStorage.setItem('bdneeds_user', JSON.stringify(data.user));
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Network error during login' };
    }
  };

  const register = async (name: string, email: string, pass: string, phone: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Registration failed' };
      }
      setUser(data.user);
      localStorage.setItem('bdneeds_user', JSON.stringify(data.user));
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Network error during registration' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bdneeds_user');
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    nextAuthSignOut({ redirect: false });
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!user) return { success: false, message: 'Not logged in' };
    
    try {
      const res = await fetch('/api/user/update-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, avatarUrl }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, message: data.error || 'Failed to update avatar' };
      }
      
      const updatedUser = { ...user, avatarUrl };
      setUser(updatedUser);
      localStorage.setItem('bdneeds_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Network error while updating avatar' };
    }
  };

  const updateProfile = async (data: { name?: string; phone?: string }) => {
    if (!user) return { success: false, message: 'Not logged in' };

    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...data }),
      });
      const resData = await res.json();

      if (!res.ok) {
        return { success: false, message: resData.error || 'Failed to update profile' };
      }

      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('bdneeds_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Network error while updating profile' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isModerator: user?.role === 'MODERATOR',
        isAuthLoading,
        login,
        register,
        logout,
        updateAvatar,
        updateProfile,
      }}
    >
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
