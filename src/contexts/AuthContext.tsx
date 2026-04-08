"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type DemoUser = {
  name: string;
  email: string;
};

type AuthContextValue = {
  user: DemoUser | null;
  isReady: boolean;
  login: (email: string, password: string) => void;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    shopName: string;
  }) => void;
  logout: () => void;
};

const STORAGE_KEY = "karobaar_demo_auth";

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoUser;
    if (!parsed?.email || !parsed?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUser(readStoredUser());
    setIsReady(true);
  }, []);

  const persist = useCallback((u: DemoUser | null) => {
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
    setUser(u);
  }, []);

  const login = useCallback(
    (email: string, _password: string) => {
      const local = email.trim().split("@")[0] ?? "user";
      const pretty = local
        .replace(/[._-]+/g, " ")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
      persist({
        name: pretty || "Demo User",
        email: email.trim().toLowerCase(),
      });
    },
    [persist]
  );

  const signup = useCallback(
    (data: {
      name: string;
      email: string;
      password: string;
      shopName: string;
    }) => {
      const name =
        data.name.trim() ||
        data.shopName.trim() ||
        data.email.split("@")[0] ||
        "Karobaar User";
      persist({
        name,
        email: data.email.trim().toLowerCase(),
      });
    },
    [persist]
  );

  const logout = useCallback(() => {
    persist(null);
  }, [persist]);

  const value = useMemo(
    () => ({ user, isReady, login, signup, logout }),
    [user, isReady, login, signup, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
