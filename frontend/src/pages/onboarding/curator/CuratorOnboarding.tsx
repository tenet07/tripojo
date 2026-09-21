import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingShell } from "../OnboardingShell";
import { Input, Textarea } from "../../../design-system/FormFields";
import { Button } from "../../../design-system/Button";
import { useToast } from "../../../design-system/Toast";
import { api, ApiError } from "../../../lib/api";
import type { CuratorProfile, TripActivity } from "../../../types";

const STEPS = [
  { key: "profile", label: "Your profile" },
  { key: "socials", label: "Social reach" },
  { key: "first_trip", label: "First trip" },
];

const stepIndex: Record<string, number> = { profile: 0, socials: 1, first_trip: 2, done: 3 };

export default function CuratorOnboarding() {
  const [profile, setProfile] = useState<CuratorProfile | null>(null);
  const [stepKey, setStepKey] = useState("profile");
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    api.get<CuratorProfile>("/curator/profile").then((p) => {
      setProfile(p);
      setStepKey(p.onboarding_step === "done" ? "first_trip" : p.onboarding_step);
      setLoading(false);
    });
  }, []);

  function goToDashboard() {
    toast.show("You're live! Your trip is published.");
    navigate("/curator/dashboard");
  }

  if (loading || !profile) {
    return <OnboardingShell eyebrow="Curator setup" title="Loading…" subtitle="" steps={STEPS} currentIndex={0}>
      <p className="text-sm text-ink-500">One moment.</p>
    </OnboardingShell>;
  }

  return (
    <OnboardingShell
      eyebrow="Curator setup"
      title="Set yourself up to publish trips"
      subtitle="Three quick steps, then your first trip goes live for travelers to book."
      steps={STEPS}
      currentIndex={stepIndex[stepKey] ?? 0}
    >
      {stepKey === "profile" && (
        <ProfileStep
          profile={profile}
          onSaved={(p) => {
            setProfile(p);
            setStepKey("socials");
          }}
        />
      )}
      {stepKey === "socials" && (
        <SocialsStep
          profile={profile}
          onBack={() => setStepKey("profile")}
          onSaved={(p) => {
            setProfile(p);
            setStepKey("first_trip");
          }}
        />
      )}
      {stepKey === "first_trip" && <FirstTripStep onBack={() => setStepKey("socials")} onPublished={goToDashboard} />}
    </OnboardingShell>
  );
}

function ProfileStep({ profile, onSaved }: { profile: CuratorProfile; onSaved: (p: CuratorProfile) => void }) {
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await api.patch<CuratorProfile>("/curator/profile", {
        display_name: displayName,
        bio,
        avatar_url: avatarUrl,
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.errors.join(", ") : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input
        label="Curator / brand name"
        required
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Ananya Explores"
      />
      <Textarea
        label="Bio"
        required
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Tell travelers what kind of trips you run and who they're for."
      />
      <Input
        label="Avatar image URL"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        placeholder="https://…"
        hint="Optional for now — paste a link, we'll add real uploads later."
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" loading={saving} fullWidth>
        Continue
      </Button>
    </form>
  );
}

function SocialsStep({
  profile,
  onBack,
  onSaved,
}: {
  profile: CuratorProfile;
  onBack: () => void;
  onSaved: (p: CuratorProfile) => void;
}) {
  const [instagram, setInstagram] = useState(profile.instagram_handle || "");
  const [tiktok, setTiktok] = useState(profile.tiktok_handle || "");
  const [youtube, setYoutube] = useState(profile.youtube_handle || "");
  const [followers, setFollowers] = useState(profile.follower_count?.toString() || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!instagram && !tiktok && !youtube) {
      setError("Link at least one social account so travelers can verify who you are.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await api.patch<CuratorProfile>("/curator/profile", {
        instagram_handle: instagram,
        tiktok_handle: tiktok,
        youtube_handle: youtube,
        follower_count: Number(followers) || 0,
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.errors.join(", ") : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input label="Instagram handle" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@yourhandle" />
      <Input label="TikTok handle" value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="@yourhandle" />
      <Input label="YouTube channel" value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="@yourchannel" />
      <Input
        label="Approx. follower count"
        type="number"
        min={0}
        value={followers}
        onChange={(e) => setFollowers(e.target.value)}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-3">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" loading={saving} fullWidth>
          Continue
        </Button>
      </div>
    </form>
  );
}

function FirstTripStep({ onBack, onPublished }: { onBack: () => void; onPublished: () => void }) {
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("10");
  const [activities, setActivities] = useState<TripActivity[]>([{ day_number: 1, title: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateActivity(i: number, field: keyof TripActivity, value: string | number) {
    setActivities((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));
  }

  function addActivity() {
    setActivities((prev) => [...prev, { day_number: prev.length + 1, title: "" }]);
  }

  async function saveDraft() {
    setSaving(true);
    setError(null);
    try {
      await api.post("/curator/trips", {
        title,
        destination,
        description,
        start_date: startDate,
        end_date: endDate,
        base_price_cents: Math.round(Number(price) * 100),
        capacity: Number(capacity),
        status: "draft",
        trip_activities_attributes: activities.filter((a) => a.title),
      });
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.errors.join(", ") : "Could not save trip");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function onSubmit(e: FormEvent, publish: boolean) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post("/curator/trips", {
        title,
        destination,
        description,
        start_date: startDate,
        end_date: endDate,
        base_price_cents: Math.round(Number(price) * 100),
        capacity: Number(capacity),
        status: publish ? "published" : "draft",
        trip_activities_attributes: activities.filter((a) => a.title),
      });
      onPublished();
    } catch (err) {
      setError(err instanceof ApiError ? err.errors.join(", ") : "Could not save trip");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => onSubmit(e, true)} className="flex flex-col gap-4">
      <Input label="Trip title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Himachal Backpacking Loop" />
      <Input
        label="Destination"
        required
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="Himachal Pradesh, India"
      />
      <Textarea
        label="Trip description"
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What makes this trip worth booking?"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Start date" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="End date" type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price per person"
          type="number"
          min={1}
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="18500"
        />
        <Input label="Capacity (travelers)" type="number" min={1} required value={capacity} onChange={(e) => setCapacity(e.target.value)} />
      </div>

      <div>
        <p className="text-sm font-medium text-ink-900">Quick itinerary</p>
        <div className="mt-2 flex flex-col gap-2">
          {activities.map((a, i) => (
            <div key={i} className="flex gap-2">
              <span className="mt-2.5 w-14 shrink-0 text-xs text-ink-500">Day {a.day_number}</span>
              <Input
                value={a.title}
                onChange={(e) => updateActivity(i, "title", e.target.value)}
                placeholder="Trek to Tosh, village homestay"
                className="flex-1"
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={addActivity} className="mt-2 text-sm font-medium text-primary-600">
          + Add another day
        </button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-col gap-2 pt-2 sm:flex-row">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          variant="secondary"
          loading={saving}
          onClick={async () => {
            const ok = await saveDraft();
            if (ok) onPublished();
          }}
        >
          Save as draft
        </Button>
        <Button type="submit" loading={saving} fullWidth>
          Publish trip
        </Button>
      </div>
    </form>
  );
}
