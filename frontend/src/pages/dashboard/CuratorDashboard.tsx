import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NavBar } from "../../design-system/NavBar";
import { Card, CardHeader } from "../../design-system/Card";
import { Badge } from "../../design-system/Badge";
import { Button } from "../../design-system/Button";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";
import { money } from "../../lib/money";
import type { CuratorProfile, Trip } from "../../types";

export default function CuratorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CuratorProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get<CuratorProfile>("/curator/profile"), api.get<Trip[]>("/curator/trips")]).then(
      ([p, t]) => {
        setProfile(p);
        setTrips(t);
        setLoading(false);
      }
    );
  }, []);

  const published = trips.filter((t) => t.status === "published").length;
  const drafts = trips.filter((t) => t.status === "draft").length;

  return (
    <div className="min-h-screen bg-bg">
      <NavBar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">Hey {user?.name?.split(" ")[0]} 👋</h1>
            <p className="text-sm text-ink-500">
              {profile?.verified ? <Badge tone="teal">Verified curator</Badge> : <Badge tone="warning">Not yet verified</Badge>}
            </p>
          </div>
          <Button onClick={() => (window.location.href = "/onboarding/curator")}>
            Create a trip
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-ink-500">Published trips</p>
            <p className="mt-1 font-display text-3xl font-bold text-ink-900">{loading ? "–" : published}</p>
          </Card>
          <Card>
            <p className="text-sm text-ink-500">Drafts</p>
            <p className="mt-1 font-display text-3xl font-bold text-ink-900">{loading ? "–" : drafts}</p>
          </Card>
          <Card>
            <p className="text-sm text-ink-500">Follower reach</p>
            <p className="mt-1 font-display text-3xl font-bold text-ink-900">
              {loading ? "–" : (profile?.follower_count || 0).toLocaleString()}
            </p>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader title="Your trips" subtitle="Manage the trips you've created" />
          {loading && <p className="text-sm text-ink-500">Loading…</p>}
          {!loading && trips.length === 0 && (
            <p className="text-sm text-ink-500">
              No trips yet. <Link to="/onboarding/curator" className="font-medium text-primary-600">Create your first one</Link>.
            </p>
          )}
          <div className="flex flex-col divide-y divide-ink-100">
            {trips.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-ink-900">{trip.title}</p>
                  <p className="text-sm text-ink-500">
                    {trip.destination} · {trip.start_date} → {trip.end_date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink-900">
                    {money(trip.base_price_cents, trip.currency)}
                  </span>
                  <Badge tone={trip.status === "published" ? "success" : "neutral"}>{trip.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
