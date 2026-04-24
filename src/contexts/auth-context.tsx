"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@/lib/api/types";
import { fetchMe } from "@/lib/api/auth";
import { getAuthToken } from "@/lib/auth/storage";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (u: User | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { user: u } = await fetchMe();
        if (!cancelled) setUser(u);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
