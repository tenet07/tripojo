import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Button } from "./Button";

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl font-extrabold tracking-tight text-ink-900">
          tripojo<span className="text-primary-500">.</span>
        </Link>

        <nav className="flex items-center gap-3">
          {!user && (
            <>
              <Link to="/login" className="px-3 py-2 text-sm font-medium text-ink-700 hover:text-ink-900">
                Log in
              </Link>
              <Button size="sm" onClick={() => navigate("/signup")}>
                Get started
              </Button>
            </>
          )}

          {user && (
            <>
              <Link
                to={user.role === "curator" ? "/curator/dashboard" : "/host/dashboard"}
                className="px-3 py-2 text-sm font-medium text-ink-700 hover:text-ink-900"
              >
                Dashboard
              </Link>
              <span className="hidden text-sm text-ink-500 sm:inline">{user.name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Log out
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
