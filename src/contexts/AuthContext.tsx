"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import * as authApi from "@/api/auth";
import type { AuthUser } from "@/api/auth";
import {
  ApiError,
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
} from "@/api/client";

export type LoginResult = { ok: true } | { ok: false; message: string };

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      let token = getToken();
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      if (authApi.accessTokenLooksExpired(token)) {
        if (getRefreshToken()) {
          const refreshed = await authApi.refreshAccessToken();
          if (refreshed?.token) {
            setToken(refreshed.token);
            if (refreshed.refreshToken) setRefreshToken(refreshed.refreshToken);
            token = refreshed.token;
          } else {
            if (!cancelled) {
              setToken(null);
              setRefreshToken(null);
              setUser(null);
              setIsLoading(false);
            }
            return;
          }
        } else {
          if (!cancelled) {
            setToken(null);
            setUser(null);
            setIsLoading(false);
          }
          return;
        }
      }

      if (!cancelled) {
        setUser(authApi.sessionUserFromAccessToken(token));
        setIsLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login: AuthContextType["login"] = async (email, password) => {
    try {
      const result = await authApi.login({ email, password });
      setToken(result.token);
      setRefreshToken(result.refreshToken || null);
      setUser(result.user);
      return { ok: true };
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Network error";
      return { ok: false, message };
    }
  };

  const logout = async () => {
    await authApi.logout();
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
