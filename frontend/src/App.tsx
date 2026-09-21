import { Link, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import NotFound from "./pages/NotFound";
import Browse from "./pages/traveler/Browse";
import TripDetail from "./pages/traveler/TripDetail";
import Checkout from "./pages/traveler/Checkout";
import TripBuilder from "./pages/curator/TripBuilder";
import CuratorOnboarding from "./pages/onboarding/curator/CuratorOnboarding";
import HostOnboarding from "./pages/onboarding/host/HostOnboarding";
import CuratorDashboard from "./pages/dashboard/CuratorDashboard";
import HostDashboard from "./pages/dashboard/HostDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./lib/auth";

function TopBar() {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-ink-200 bg-surface px-4 py-3 sm:px-6">
      <Link to="/" className="text-lg font-bold tracking-tight text-brand-500">
        tripojo
      </Link>
      <nav className="ml-4 hidden gap-4 text-[12.5px] text-ink-500 sm:flex">
        <Link to="/" className="hover:text-brand-500">
          Explore trips
        </Link>
        <Link to="/curator/trip-builder" className="hover:text-brand-500">
          Trip builder
        </Link>
      </nav>
      <div className="ml-auto flex items-center gap-3 text-[12.5px]">
        {user ? (
          <>
            <span className="hidden text-ink-500 sm:inline">{user.name}</span>
            <button type="button" onClick={logout} className="font-bold text-ink-500 hover:text-brand-500">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="font-bold text-ink-500 hover:text-brand-500">
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-brand-500 px-3.5 py-1.5 font-bold text-white hover:bg-brand-600"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default function App() {
  return (
    <>
      <TopBar />
      <Routes>
        {/* Traveler side — the public product */}
        <Route path="/" element={<Browse />} />
        <Route path="/trips/:slug" element={<TripDetail />} />
        <Route path="/checkout/:slug" element={<Checkout />} />

        <Route path="/for-partners" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Curator */}
        <Route
          path="/curator/trip-builder"
          element={
            <ProtectedRoute role="curator">
              <TripBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/curator"
          element={
            <ProtectedRoute role="curator">
              <CuratorOnboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/curator/dashboard"
          element={
            <ProtectedRoute role="curator">
              <CuratorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Host */}
        <Route
          path="/onboarding/host"
          element={
            <ProtectedRoute role="host">
              <HostOnboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/dashboard"
          element={
            <ProtectedRoute role="host">
              <HostDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
