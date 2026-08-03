"use client";

// ─── Auth-State ───────────────────────────────────────────────────────────────
// Hält den angemeldeten Nutzer (PublicUser) + das JWT (accessToken) und
// persistiert die Session in localStorage. Das Backend gibt den Token im
// Response-Body zurück, daher localStorage (Standard für Token-in-Body-APIs).

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { warmup } from "@/lib/api";
import type { AuthSession, PublicUser } from "@/lib/api";

const STORAGE_KEY = "portawerk_session_v1";

interface AuthContextValue {
  user: PublicUser | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (session: AuthSession) => void;
  setUser: (user: PublicUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Backend früh aufwecken (Render-Free schläft) → weniger Kaltstart-Fehler.
    warmup();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as { user: PublicUser; token: string };
        setUserState(s.user);
        setToken(s.token);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const login = useCallback((session: AuthSession) => {
    setUserState(session.user);
    setToken(session.accessToken);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: session.user, token: session.accessToken })
      );
    } catch {
      /* ignore */
    }
  }, []);

  const setUser = useCallback((u: PublicUser) => {
    setUserState(u);
    setToken((t) => {
      try {
        if (t) localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, token: t }));
      } catch {
        /* ignore */
      }
      return t;
    });
  }, []);

  const logout = useCallback(() => {
    setUserState(null);
    setToken(null);
    try {
      // Alle PortaWerk-Einträge entfernen, nicht nur die Sitzung: der
      // Registrierungs-Entwurf enthält Name, E-Mail, Telefon und Arbeitsorte,
      // der Partner-Schlüssel öffnet den Auszahlungsbereich. Genau das sagt
      // auch unsere Datenschutzerklärung zu.
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("portawerk_")) localStorage.removeItem(key);
      }
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!user && !!token, hydrated, login, setUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth muss innerhalb von <AuthProvider> genutzt werden.");
  return ctx;
}
