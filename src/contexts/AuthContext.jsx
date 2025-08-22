"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export const authAlias = "user_auth"; // Add your alias here
export const userAlias = "user_detail"; // Add your alias here

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem(userAlias);
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  const login = (userData, profile, callback) => {
    localStorage.setItem(authAlias, userData);
    localStorage.setItem(userAlias, JSON.stringify(profile));
    setUser(profile);
    if (callback) callback();
  };

  const logout = (callback) => {
    localStorage.removeItem(authAlias);
    localStorage.removeItem(userAlias);
    setUser(null);
    if (callback) callback();
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}


export function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!isAuthenticated) {
    // redirect to login, preserve current path
    router.push(`/login?from=${pathname}`);
    return null;
  }

  return children;
}
