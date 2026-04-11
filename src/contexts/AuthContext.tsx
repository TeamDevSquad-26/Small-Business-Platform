"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import { getFirebaseConfigurationHelpMessage } from "@/lib/firebase/env";

export type DemoUser = {
  uid: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: DemoUser | null;
  isReady: boolean;
  /** False when app sign-in config is incomplete */
  isFirebaseConfigured: boolean;
  /** Updates account display name (syncs across the app). */
  updateDisplayName: (
    name: string
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    shopName: string;
  }) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!auth) {
      setUser(null);
      setIsReady(true);
      return;
    }

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIsReady(true);
        return;
      }
      setUser({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
        email: firebaseUser.email || "",
      });
      setIsReady(true);
    });

    return () => unsub();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!auth) {
        return {
          ok: false as const,
          message: getFirebaseConfigurationHelpMessage(),
        };
      }

      const normalizedEmail = email.trim().toLowerCase();
      const rawPassword = password.trim();

      if (!normalizedEmail || !rawPassword) {
        return { ok: false as const, message: "Email and password are required." };
      }

      try {
        await signInWithEmailAndPassword(auth, normalizedEmail, rawPassword);
        return { ok: true as const };
      } catch {
        return {
          ok: false as const,
          message: "Couldn’t sign in. Check your email and password.",
        };
      }
    },
    []
  );

  const signup = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      shopName: string;
    }) => {
      if (!auth) {
        return {
          ok: false as const,
          message: getFirebaseConfigurationHelpMessage(),
        };
      }

      const normalizedEmail = data.email.trim().toLowerCase();
      const rawPassword = data.password.trim();
      const shopName = data.shopName.trim();
      const name = data.name.trim() || shopName || data.email.split("@")[0] || "User";

      if (!normalizedEmail || !rawPassword || !shopName) {
        return {
          ok: false as const,
          message: "Name, email, password, and shop name are required.",
        };
      }

      if (rawPassword.length < 6) {
        return {
          ok: false as const,
          message: "Password must be at least 6 characters.",
        };
      }

      try {
        const cred = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          rawPassword
        );
        if (name) {
          await updateProfile(cred.user, { displayName: name });
        }
        return { ok: true as const };
      } catch {
        return {
          ok: false as const,
          message:
            "Couldn’t create your account. The email may be invalid or already in use.",
        };
      }
    },
    []
  );

  const logout = useCallback(() => {
    if (auth) void signOut(auth);
  }, []);

  const updateDisplayName = useCallback(
    async (name: string) => {
      if (!auth?.currentUser) {
        return { ok: false as const, message: "Not signed in." };
      }
      const trimmed = name.trim();
      if (!trimmed) {
        return { ok: false as const, message: "Name cannot be empty." };
      }
      try {
        await updateProfile(auth.currentUser, { displayName: trimmed });
        return { ok: true as const };
      } catch {
        return {
          ok: false as const,
          message: "Couldn’t update your name. Try again.",
        };
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      isReady,
      isFirebaseConfigured,
      updateDisplayName,
      login,
      signup,
      logout,
    }),
    [user, isReady, updateDisplayName, login, signup, logout]
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
