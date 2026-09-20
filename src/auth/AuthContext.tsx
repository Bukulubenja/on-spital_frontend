import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Role =
  | "ADMIN"
  | "RECEPTIONIST"
  | "DOCTOR"
  | "NURSE"
  | "LAB"
  | "PHARMACIST"
  | "CASHIER"
  | "STOCK_MANAGER"
  | "PLATFORM_OPERATOR";

export type Session = {
  subdomain: string;
  username: string;
  password: string;
  role: Role;
};

type AuthContextValue = {
  session: Session | null;
  login: (session: Session) => void;
  logout: () => void;
};

const STORAGE_KEY = "hms-web.session";

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): Session | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readStoredSession);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      login: (next) => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setSession(next);
      },
      logout: () => {
        sessionStorage.removeItem(STORAGE_KEY);
        setSession(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
