
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

export const authAlias = "user_auth";
export const userAlias = "user_detail";

interface User {
  _id: string; // Changed from id to _id to match MongoDB
  name: string;
  email: string;
  role: 'student' | 'doctor';
  isStudent: boolean;
  isDoctor: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: string, profile: User) => void;
  logout: (callback: () => void) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
        const storedUser = localStorage.getItem(userAlias);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        // Clear corrupted data
        localStorage.removeItem(userAlias);
        localStorage.removeItem(authAlias);
    } finally {
        setLoading(false);
    }
  }, []);

  const login = (userData: string, profile: User) => {
    localStorage.setItem(authAlias, userData);
    localStorage.setItem(userAlias, JSON.stringify(profile));
    setUser(profile);
  };

  const logout = (callback: () => void) => {
    localStorage.removeItem(authAlias);
    localStorage.removeItem(userAlias);
    setUser(null);
    callback();
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
