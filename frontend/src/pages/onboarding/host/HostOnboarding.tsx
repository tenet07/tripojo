import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingShell } from "../OnboardingShell";
import { Input, Select, Textarea } from "../../../design-system/FormFields";
import { Button } from "../../../design-system/Button";
import { Badge } from "../../../design-system/Badge";
import { useToast } from "../../../design-system/Toast";
import { api, ApiError } from "../../../lib/api";
import type { HostProfile, RoomType } from "../../../types";

const STEPS = [
  { key: "business_info", label: "Business info" },
  { key: "verification", label: "Verification" },
  { key: "first_property", label: "List your property" },
];

const stepIndex: Record<string, number> = { business_info: 0, verification: 1, first_property: 2, done: 3 };

export default function HostOnboarding() {
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [stepKey, setStepKey] = useState("business_info");
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    api.get<HostProfile>("/host/profile").then((p) => {
      setProfile(p);
      setStepKey(p.onboarding_step === "done" ? "first_property" : p.onboarding_step);
      setLoading(false);
    });
  }, []);

  function goToDashboard() {
    toast.show("Your property is live for curators to book.");
    navigate("/host/dashboard");
  }

  if (loading || !profile) {
    return (
      <OnboardingShell eyebrow="Host setup" title="Loading…" subtitle="" steps={STEPS} currentIndex={0}>
        <p className="text-sm text-ink-500">One moment.</p>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      eyebrow="Host setup"
      title="Get your property ready for group bookings"
      subtitle="Three quick steps, then curators can start requesting rooms for their groups."
      steps={STEPS}
      currentIndex={stepIndex[stepKey] ?? 0}
    >
      {stepKey === "business_info" && (
        <BusinessInfoStep
          profile={profile}
          onSaved={(p) => {
            setProfile(p);
            setStepKey("verification");
          }}
        />
      )}
      {stepKey === "verification" && (
        <VerificationStep
          profile={profile}
          onBack={() => setStepKey("business_info")}
          onSaved={(p) => {
            setProfile(p);
            setStepKey("first_property");
          }}
        />
      )}
      {stepKey === "first_property" && (
        <FirstPropertyStep onBack={() => setStepKey("verification")} onPublished={goToDashboard} />
      )}
    </OnboardingShell>
  );
}

function BusinessInfoStep({ profile, onSaved }: { profile: HostProfile; onSaved: (p: HostProfile) => void }) {
  const [businessName, setBusinessName] = useState(profile.business_name || "");
  const [businessType, setBusinessType] = useState(profile.business_type || "hostel");
  const [phone, setPhone] = useState(profile.contact_phone || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await api.patch<HostProfile>("/host/profile", {
        business_name: businessName,
        business_type: businessType,
        contact_phone: phone,
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
        label="Business name"
        required
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        placeholder="Blue Pine Hostel"
      />
      <Select
        label="Property type"
        required
        value={businessType}
        onChange={(e) => setBusinessType(e.target.value)}
        options={[
          { value: "hostel", label: "Hostel" },
          { value: "hotel", label: "Hotel" },
          { value: "homestay", label: "Homestay" },
          { value: "guesthouse", label: "Guesthouse" },
          { value: "other", label: "Other" },
        ]}
      />
      <Input
        label="Contact phone"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+91 98765 43210"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" loading={saving} fullWidth>
        Continue
      </Button>
    </form>
  );
}

function VerificationStep({
  profile,
  onBack,
  onSaved,
}: {
  profile: HostProfile;
  onBack: () => void;
  onSaved: (p: HostProfile) => void;
}) {
  const [docUrl, setDocUrl] = useState(profile.verification_doc_url || "");
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!confirmed) {
      setError("Please confirm the details above are accurate.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await api.patch<HostProfile>("/host/profile", {
        verification_doc_url: docUrl,
        verification_status: "pending",
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
      <div className="flex items-start gap-3 rounded-xl bg-teal-50 p-4">
        <Badge tone="teal">Trust &amp; safety</Badge>
        <p className="text-sm text-teal-700">
          Verified hosts get priority placement and a trust badge curators look for before booking a group.
          Uploads go live in a later release — for now, paste a link to your business license or ID and
          we'll mark you as pending review.
        </p>
      </div>
      <Input
        label="License / ID document link"
        value={docUrl}
        onChange={(e) => setDocUrl(e.target.value)}
        placeholder="https://…"
        hint="Optional for the demo, required before you can go fully verified."
      />
      <label className="flex items-start gap-2 text-sm text-ink-700">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-ink-300 text-primary-500 focus:ring-primary-300"
        />
        I confirm I'm authorized to list and manage bookings for this property.
      </label>
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

function FirstPropertyStep({ onBack, onPublished }: { onBack: () => void; onPublished: () => void }) {
  const [name, setName] = useState("");
  const [propertyType, setPropertyType] = useState("hostel");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("India");
  const [description, setDescription] = useState("");
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([
    { name: "", room_kind: "dorm", capacity: 6, price_per_night: 0, total_units: 1 },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRoom(i: number, field: keyof RoomType, value: string | number) {
    setRoomTypes((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  function addRoom() {
    setRoomTypes((prev) => [...prev, { name: "", room_kind: "private", capacity: 2, price_per_night: 0, total_units: 1 }]);
  }

  async function submit(status: "draft" | "pending_review") {
    setSaving(true);
    setError(null);
    try {
      await api.post("/host/properties", {
        name,
        property_type: propertyType,
        address,
        city,
        country,
        description,
        status,
        room_types_attributes: roomTypes.filter((r) => r.name),
      });
      onPublished();
    } catch (err) {
      setError(err instanceof ApiError ? err.errors.join(", ") : "Could not save property");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit("pending_review");
      }}
      className="flex flex-col gap-4"
    >
      <Input label="Property name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Blue Pine Hostel" />
      <Select
        label="Type"
        value={propertyType}
        onChange={(e) => setPropertyType(e.target.value)}
        options={[
          { value: "hostel", label: "Hostel" },
          { value: "hotel", label: "Hotel" },
          { value: "homestay", label: "Homestay" },
        ]}
      />
      <Input label="Address" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Old Manali Road" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="City" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Manali" />
        <Input label="Country" required value={country} onChange={(e) => setCountry(e.target.value)} />
      </div>
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What makes this a good pick for a curator's group?"
      />

      <div>
        <p className="text-sm font-medium text-ink-900">Room types</p>
        <div className="mt-2 flex flex-col gap-3">
          {roomTypes.map((r, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 rounded-xl border border-ink-100 p-3 sm:grid-cols-4">
              <Input
                placeholder="6-Bed Mixed Dorm"
                value={r.name}
                onChange={(e) => updateRoom(i, "name", e.target.value)}
                className="sm:col-span-2"
              />
              <Input
                type="number"
                min={1}
                placeholder="Capacity"
                value={r.capacity}
                onChange={(e) => updateRoom(i, "capacity", Number(e.target.value))}
              />
              <Input
                type="number"
                min={1}
                placeholder="Price/night"
                value={r.price_per_night}
                onChange={(e) => updateRoom(i, "price_per_night", Number(e.target.value))}
              />
              <Input
                type="number"
                min={1}
                placeholder="Units available"
                value={r.total_units}
                onChange={(e) => updateRoom(i, "total_units", Number(e.target.value))}
                className="col-span-2 sm:col-span-1"
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={addRoom} className="mt-2 text-sm font-medium text-primary-600">
          + Add another room type
        </button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-col gap-2 pt-2 sm:flex-row">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button type="button" variant="secondary" loading={saving} onClick={() => submit("draft")}>
          Save as draft
        </Button>
        <Button type="submit" loading={saving} fullWidth>
          Submit for review
        </Button>
      </div>
    </form>
  );
}
