import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "./api";
import type { AuthUser, Role } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signup: (params: { name: string; email: string; password: string; role: Role }) => Promise<AuthUser>;
  login: (params: { email: string; password: string }) => Promise<AuthUser>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    const token = localStorage.getItem("tripojo_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const me = await api.get<AuthUser>("/auth/me");
      setUser(me);
    } catch {
      localStorage.removeItem("tripojo_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signup(params: { name: string; email: string; password: string; role: Role }) {
    const data = await api.post<{ token: string; user: AuthUser }>("/auth/signup", params);
    localStorage.setItem("tripojo_token", data.token);
    setUser(data.user);
    return data.user;
  }

  async function login(params: { email: string; password: string }) {
    const data = await api.post<{ token: string; user: AuthUser }>("/auth/login", params);
    localStorage.setItem("tripojo_token", data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("tripojo_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
