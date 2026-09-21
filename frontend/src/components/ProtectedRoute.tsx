import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import type { Role } from "../types";

export function ProtectedRoute({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-ink-500">Loading…</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === "curator" ? "/curator/dashboard" : "/host/dashboard"} replace />;
  }

  return <>{children}</>;
}
