import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader } from "../../design-system/Card";
import { Badge } from "../../design-system/Badge";
import { Button } from "../../design-system/Button";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";
import type { HostProfile, Property } from "../../types";

export default function HostDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get<HostProfile>("/host/profile"), api.get<Property[]>("/host/properties")]).then(
      ([p, props]) => {
        setProfile(p);
        setProperties(props);
        setLoading(false);
      }
    );
  }, []);

  const totalUnits = properties.reduce((sum, p) => sum + (p.total_capacity || 0), 0);
  const live = properties.filter((p) => p.status === "live").length;

  const verificationTone = profile?.verification_status === "verified" ? "teal" : profile?.verification_status === "pending" ? "warning" : "neutral";

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">Hey {user?.name?.split(" ")[0]} 👋</h1>
            <p className="mt-1">
              <Badge tone={verificationTone}>{profile?.verification_status || "unverified"}</Badge>
            </p>
          </div>
          <Button onClick={() => (window.location.href = "/onboarding/host")}>List another property</Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-ink-500">Live listings</p>
            <p className="mt-1 font-display text-3xl font-bold text-ink-900">{loading ? "–" : live}</p>
          </Card>
          <Card>
            <p className="text-sm text-ink-500">Total properties</p>
            <p className="mt-1 font-display text-3xl font-bold text-ink-900">{loading ? "–" : properties.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-ink-500">Bed/room capacity</p>
            <p className="mt-1 font-display text-3xl font-bold text-ink-900">{loading ? "–" : totalUnits}</p>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader title="Your properties" subtitle="Rooms curators can request for group bookings" />
          {loading && <p className="text-sm text-ink-500">Loading…</p>}
          {!loading && properties.length === 0 && (
            <p className="text-sm text-ink-500">
              No properties yet. <Link to="/onboarding/host" className="font-medium text-primary-600">List your first one</Link>.
            </p>
          )}
          <div className="flex flex-col divide-y divide-ink-100">
            {properties.map((property) => (
              <div key={property.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-ink-900">{property.name}</p>
                  <p className="text-sm text-ink-500">
                    {property.city}, {property.country} · {property.room_types.length} room types
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {property.from_price != null && (
                    <span className="text-sm font-semibold text-ink-900">
                      from ₹{Number(property.from_price).toLocaleString()}/night
                    </span>
                  )}
                  <Badge tone={property.status === "live" ? "success" : property.status === "pending_review" ? "warning" : "neutral"}>
                    {property.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
