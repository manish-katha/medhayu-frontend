"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const TokenExpireContext = createContext(null);

export const useTokenExpire = () => useContext(TokenExpireContext);

export const TokenExpireProvider = ({ children }) => {
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onTokenExpired = () => setIsExpired(true);
    window.addEventListener("token-expired", onTokenExpired);

    return () => {
      window.removeEventListener("token-expired", onTokenExpired);
    };
  }, []);

  const openTokenExpire = () => setIsExpired(true);
  const closeTokenExpire = () => setIsExpired(false);

  return (
    <TokenExpireContext.Provider
      value={{ isExpired, setIsExpired, openTokenExpire, closeTokenExpire }}
    >
      {children}
    </TokenExpireContext.Provider>
  );
};
