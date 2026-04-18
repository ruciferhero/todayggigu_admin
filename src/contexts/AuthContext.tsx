"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import * as authApi from "@/api/auth";
import type { AuthUser } from "@/api/auth";
import {
  ApiError,
  getToken,
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
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/login") {
      setIsLoading(false);
      return;
    }
    if (!getToken()) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const me = await authApi.fetchMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) {
          setToken(null);
          setRefreshToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (isLoading) {
    return null;
  }

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
