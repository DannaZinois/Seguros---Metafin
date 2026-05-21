import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Role = "admin" | "company" | "client";

export interface AuthUser {
  email: string;
  role: Role;
  name: string;
}

const USERS: Record<string, { password: string; user: AuthUser }> = {
  "admin@gmail.com": {
    password: "Pass@123",
    user: { email: "admin@gmail.com", role: "admin", name: "John Doe" },
  },
  "company@gmail.com": {
    password: "Pass@123",
    user: { email: "company@gmail.com", role: "company", name: "Compañía" },
  },
  "client@gmail.com": {
    password: "Pass@123",
    user: { email: "client@gmail.com", role: "client", name: "Cliente" },
  },
};

const STORAGE_KEY = "zinois.auth";

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string, remember: boolean) => AuthUser;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  const login = (email: string, password: string, remember: boolean) => {
    const entry = USERS[email.trim().toLowerCase()];
    if (!entry || entry.password !== password) {
      throw new Error("Correo o contraseña incorrectos.");
    }
    const store = remember ? localStorage : sessionStorage;
    store.setItem(STORAGE_KEY, JSON.stringify(entry.user));
    setUser(entry.user);
    return entry.user;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}