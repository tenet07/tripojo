import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NavBar } from "../../design-system/NavBar";
import { Card } from "../../design-system/Card";
import { Input } from "../../design-system/FormFields";
import { Button } from "../../design-system/Button";
import { useAuth } from "../../lib/auth";
import { ApiError } from "../../lib/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login({ email, password });
      if (!user.onboarding_complete) {
        navigate(user.role === "curator" ? "/onboarding/curator" : "/onboarding/host");
      } else {
        navigate(user.role === "curator" ? "/curator/dashboard" : "/host/dashboard");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.errors.join(", ") : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <NavBar />
      <div className="mx-auto flex max-w-md flex-col justify-center px-6 py-16">
        <h1 className="font-display text-2xl font-bold text-ink-900">Welcome back</h1>
        <Card className="mt-6">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" loading={loading} fullWidth>
              Log in
            </Button>
          </form>
        </Card>
        <p className="mt-4 text-center text-sm text-ink-500">
          New to Tripojo? <Link to="/signup" className="font-medium text-primary-600">Create an account</Link>
        </p>
        <p className="mt-6 rounded-xl bg-ink-100/60 p-3 text-center text-xs text-ink-500">
          Demo: curator@tripojo.dev / password123 &nbsp;·&nbsp; host@tripojo.dev / password123
        </p>
      </div>
    </div>
  );
}
