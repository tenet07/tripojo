import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg text-center">
      <h1 className="font-display text-3xl font-bold text-ink-900">Page not found</h1>
      <Link to="/" className="text-primary-600 font-medium">
        Back to Tripojo
      </Link>
    </div>
  );
}
