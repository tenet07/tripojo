import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Button, Chip, Photo, PriceBar, SectionHead } from "../../design-system/klook";
import { money } from "../../lib/money";
import { tripsApi } from "../../lib/tripojoApi";
import { useQuote } from "../../lib/useQuote";
import { useAuth } from "../../lib/auth";
import type { Booking, Selections, TripDetail } from "../../types/addons";

/**
 * Checkout re-quotes rather than trusting a total handed over from the
 * previous screen. Prices can move between picking and paying, and the
 * number someone is asked to approve has to be the one the server will
 * actually charge.
 */
export default function Checkout() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation() as { state?: { travelers?: number; selections?: Selections } };
  const { user } = useAuth();

  const travelers = location.state?.travelers ?? 4;
  const selections = location.state?.selections ?? {};

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { quote } = useQuote(slug, travelers, selections);

  useEffect(() => {
    if (!slug) return;
    tripsApi.get(slug).then(({ trip: loaded }) => setTrip(loaded)).catch(() => undefined);
  }, [slug]);

  async function pay() {
    if (!slug || !user) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await tripsApi.book(slug, {
        travelers,
        selections,
        lead: { name: user.name, email: user.email },
      });
      setBooking(res.booking);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ok-50 text-2xl">
          ✓
        </div>
        <h1 className="mt-4 text-xl font-bold">You're booked</h1>
        <p className="mt-1.5 text-[13px] text-ink-500">
          Reference <b className="text-ink-900">{booking.reference}</b> ·{" "}
          {money(booking.total_cents, booking.currency)} for {booking.travelers_count} travellers.
        </p>
        <div className="mt-5 rounded-card border border-ink-200 p-4 text-left">
          <h2 className="text-[13px] font-bold">Add-ons confirmed with partners</h2>
          <ul className="mt-2 flex flex-col gap-1.5">
            {booking.add_ons.map((line) => (
              <li key={line.id} className="flex justify-between gap-3 text-[12.5px]">
                <span className="text-ink-500">
                  {line.label} × {line.qty}
                </span>
                <span className="font-bold tabular-nums">
                  {money(line.line_total_cents, booking.currency)}
                </span>
              </li>
            ))}
            {booking.add_ons.length === 0 ? (
              <li className="text-[12.5px] text-ink-400">No add-ons on this booking.</li>
            ) : null}
          </ul>
        </div>
        <Link to="/" className="mt-6 inline-block text-sm font-bold text-brand-500">
          Back to trips
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold">Checkout</h1>

        <section className="flex flex-col gap-3">
          <SectionHead>Who's travelling</SectionHead>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Lead traveller" value={user?.name ?? "Sign in to continue"} />
            <Field label="Email" value={user?.email ?? "—"} />
          </div>
          <p className="text-meta text-ink-400">
            We'll collect the other {Math.max(0, travelers - 1)} travellers' names after booking.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHead>Payment</SectionHead>
          <div className="flex flex-wrap gap-2">
            {["UPI", "Card", "Netbanking", "Pay 20% now, rest later"].map((method, i) => (
              <span
                key={method}
                className={`rounded-pill border-[1.5px] px-4 py-2 text-[12.5px] ${
                  i === 0 ? "border-brand-500 font-bold text-brand-500" : "border-ink-200 text-ink-900"
                }`}
              >
                {method}
              </span>
            ))}
          </div>
          <p className="rounded-card bg-band p-3.5 text-[12.5px] leading-relaxed text-ink-500">
            Add-on partners are paid after the trip completes. Tripojo holds their share until each
            partner marks their service delivered, which is what makes a multi-party basket safe to
            sell in one payment.
          </p>
          {error ? <p className="text-[12.5px] text-alert-500">{error}</p> : null}
        </section>
      </div>

      <aside className="flex flex-col gap-2.5">
        <div className="overflow-hidden rounded-card border border-ink-200">
          <div className="flex flex-col gap-3 p-4">
            {trip ? (
              <div className="flex items-center gap-3">
                <Photo kind={trip.photo ?? "jungle"} className="h-12 w-16 shrink-0 rounded-md" />
                <div>
                  <h2 className="text-[13px] font-bold leading-tight">{trip.title}</h2>
                  <p className="text-meta text-ink-400">
                    {trip.start_date} · {trip.curator.instagram_handle}
                  </p>
                </div>
              </div>
            ) : null}

            <hr className="border-ink-200" />

            {quote ? (
              <div className="flex flex-col gap-2 text-[12.5px]">
                <Line
                  label={`Base trip × ${quote.travelers}`}
                  value={money(quote.base_total_cents, quote.currency)}
                />
                {quote.addon_lines.map((line) => (
                  <Line
                    key={line.key}
                    label={`${line.label} × ${line.qty}`}
                    value={money(line.line_total_cents, quote.currency)}
                  />
                ))}
                <hr className="border-ink-200" />
                <Line label="Taxes & fees" value={money(quote.fees_cents, quote.currency)} muted />
              </div>
            ) : (
              <p className="text-meta text-ink-400">Pricing your basket…</p>
            )}
          </div>

          <PriceBar
            amountCents={quote?.total_cents ?? 0}
            currency={quote?.currency ?? "INR"}
            hint={`Total for ${travelers} travellers`}
          >
            <Button onClick={pay} disabled={submitting || !quote || !user}>
              {submitting ? "Booking…" : "Pay now"}
            </Button>
          </PriceBar>
        </div>
        <Chip tone="ok">Free cancellation until 5 Nov</Chip>
        {!user ? (
          <p className="text-meta text-ink-400">
            <Link to="/login" className="font-bold text-brand-500">
              Log in
            </Link>{" "}
            to complete this booking.
          </p>
        ) : null}
      </aside>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold text-ink-500">{label}</span>
      <span className="rounded-lg border border-ink-200 px-3 py-2.5 text-[12.5px] font-medium">
        {value}
      </span>
    </label>
  );
}

function Line({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={muted ? "text-ink-400" : "text-ink-500"}>{label}</span>
      <span className={`shrink-0 tabular-nums ${muted ? "text-ink-400" : "font-bold text-ink-900"}`}>
        {value}
      </span>
    </div>
  );
}
