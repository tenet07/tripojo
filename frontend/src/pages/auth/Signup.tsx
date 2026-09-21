import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card } from "../../design-system/Card";
import { Input, Select } from "../../design-system/FormFields";
import { Button } from "../../design-system/Button";
import { useAuth } from "../../lib/auth";
import { useToast } from "../../design-system/Toast";
import { ApiError } from "../../lib/api";
import type { Role } from "../../types";

export default function Signup() {
  const [params] = useSearchParams();
  const initialRole = (params.get("role") as Role) || "curator";
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(initialRole === "host" ? "host" : "curator");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await signup({ name, email, password, role });
      toast.show("Welcome to Tripojo! Let's finish setting you up.");
      navigate(user.role === "curator" ? "/onboarding/curator" : "/onboarding/host");
    } catch (err) {
      setError(err instanceof ApiError ? err.errors.join(", ") : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-md flex-col justify-center px-6 py-16">
        <h1 className="font-display text-2xl font-bold text-ink-900">Create your Tripojo account</h1>
        <p className="mt-1 text-sm text-ink-500">Takes about a minute. You can flesh out details next.</p>

        <Card className="mt-6">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Select
              label="I am joining as a..."
              required
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              options={[
                { value: "curator", label: "Travel curator / influencer" },
                { value: "host", label: "Hostel / hotel / homestay host" },
              ]}
            />
            <Input label="Full name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ananya Rao" />
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint="At least 8 characters"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" loading={loading} fullWidth>
              Create account
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-sm text-ink-500">
          Already have an account? <Link to="/login" className="font-medium text-primary-600">Log in</Link>
        </p>
      </div>
    </div>
  );
}
