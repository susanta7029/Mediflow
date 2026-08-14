"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthResponse } from "@/types";
import api from "./axios";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<String | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("mediflow_access_token");
    const storedUser = localStorage.getItem("mediflow_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (authData: AuthResponse) => {
    localStorage.setItem("mediflow_access_token", authData.accessToken);
    localStorage.setItem("mediflow_refresh_token", authData.refreshToken);
    localStorage.setItem("mediflow_user", JSON.stringify(authData.user));
    setToken(authData.accessToken);
    setUser(authData.user);
  };

  const logout = () => {
    localStorage.removeItem("mediflow_access_token");
    localStorage.removeItem("mediflow_refresh_token");
    localStorage.removeItem("mediflow_user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token: token as string | null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
