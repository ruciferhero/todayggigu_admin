"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USER = {
  email: "todayggigu@admin.com",
  password: "todayggigu",
  name: "Admin",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("todayggigu_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    if (email === DEFAULT_USER.email && password === DEFAULT_USER.password) {
      const userData = { email, name: DEFAULT_USER.name };
      setUser(userData);
      localStorage.setItem("todayggigu_user", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("todayggigu_user");
    router.push("/login");
  };

  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
