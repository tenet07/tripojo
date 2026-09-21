import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AddOnPicker } from "../../components/AddOnPicker";
import {
  Button,
  Chip,
  Photo,
  PriceBar,
  QuantityStepper,
  Rating,
  SectionHead,
} from "../../design-system/klook";
import { money, compactCount } from "../../lib/money";
import { tripsApi } from "../../lib/tripojoApi";
import { useQuote } from "../../lib/useQuote";
import type { Selections, TripDetail as TripDetailType } from "../../types/addons";

/**
 * The traveler's buying surface. Every number on this page comes from the
 * server's quote endpoint — the client's only job is to say what was picked
 * and render what comes back.
 */
export default function TripDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<TripDetailType | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [travelers, setTravelers] = useState(4);
  const [selections, setSelections] = useState<Selections>({});
  // Which tier is showing per add-on group, including ones at quantity zero.
  const [chosenTier, setChosenTier] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!slug) return;
    tripsApi
      .get(slug)
      .then(({ trip: loaded }) => {
        setTrip(loaded);
        const defaults: Record<number, number> = {};
        loaded.add_ons.forEach((group) => {
          const recommended = group.tiers.find((t) => t.recommended) ?? group.tiers[0];
          defaults[group.product_id] = recommended.tier_id;
        });
        setChosenTier(defaults);
      })
      .catch((err: Error) => setLoadError(err.message));
  }, [slug]);

  const { quote, pending } = useQuote(slug, travelers, selections);

  const selectedCount = useMemo(
    () => Object.values(selections).filter((qty) => qty > 0).length,
    [selections],
  );

  function setTierFor(productId: number, tierId: number) {
    const previous = chosenTier[productId];
    setChosenTier((current) => ({ ...current, [productId]: tierId }));

    // Carry the quantity across when the traveler switches package, rather
    // than silently resetting it to zero and losing their choice.
    setSelections((current) => {
      const carried = previous ? current[previous] ?? 0 : 0;
      const next = { ...current };
      if (previous) delete next[previous];
      if (carried > 0) next[tierId] = carried;
      return next;
    });
  }

  function setQty(tierId: number, qty: number) {
    setSelections((current) => {
      const next = { ...current };
      if (qty <= 0) delete next[tierId];
      else next[tierId] = qty;
      return next;
    });
  }

  function goToCheckout() {
    navigate(`/checkout/${slug}`, { state: { travelers, selections } });
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-xl font-bold">We couldn't load that trip</h1>
        <p className="mt-2 text-sm text-ink-500">{loadError}</p>
        <Link to="/" className="mt-5 inline-block text-sm font-bold text-brand-500">
          Back to all trips
        </Link>
      </div>
    );
  }

  if (!trip) {
    return <div className="px-4 py-24 text-center text-sm text-ink-400">Loading trip…</div>;
  }

  return (
    <div className="pb-24 lg:pb-0">
      <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6">
        <nav className="text-meta text-ink-400">
          <Link to="/" className="hover:text-brand-500">
            Home
          </Link>{" "}
          › {trip.destination} › {trip.title}
        </nav>

        <header className="mt-2 flex flex-col gap-2.5">
          <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-[27px]">
            {trip.title} with {trip.curator.instagram_handle ?? trip.curator.display_name}
          </h1>

          <div className="flex flex-wrap gap-1.5">
            <Chip>{trip.nights} nights</Chip>
            <Chip>Small group · max {trip.capacity}</Chip>
            <Chip>{trip.spots_left} spots left</Chip>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Rating value={trip.rating} reviews={trip.reviews_count} booked={trip.bookings_count} />
            <span className="text-meta text-ink-400">📍 {trip.destination}</span>
            <Chip tone="trust">Verified curator</Chip>
            <span className="text-meta text-ink-400">
              {compactCount(trip.curator.follower_count)} followers
            </span>
          </div>
        </header>

        <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
          <Photo kind={trip.photo ?? "jungle"} className="h-56 rounded-card sm:col-span-2 sm:h-64" />
          <div className="hidden flex-col gap-1.5 sm:flex">
            <Photo kind="beach" className="h-[122px] rounded-card" />
            <Photo kind="temple" className="h-[122px] rounded-card" caption="+ 24 photos" />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_330px]">
        {/* ------------------------------------------------ left column */}
        <div className="flex flex-col gap-7">
          <section className="flex flex-col gap-2.5">
            <SectionHead>What's included</SectionHead>
            <p className="text-[13px] leading-relaxed text-ink-500">{trip.description}</p>
          </section>

          <section className="flex flex-col gap-3">
            <div>
              <SectionHead>Choose your add-ons</SectionHead>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">
                Partners {trip.curator.display_name} works with. Pick a package and set how many —
                your total updates as you go, and it's all one booking and one payment.
              </p>
            </div>

            {trip.add_ons.length === 0 ? (
              <p className="rounded-card bg-band p-4 text-[13px] text-ink-500">
                This trip doesn't have any add-ons yet.
              </p>
            ) : (
              trip.add_ons.map((group) => {
                const tierId = chosenTier[group.product_id] ?? group.tiers[0].tier_id;
                return (
                  <AddOnPicker
                    key={group.product_id}
                    group={group}
                    travelers={travelers}
                    selectedTierId={tierId}
                    qty={selections[tierId] ?? 0}
                    onSelectTier={(next) => setTierFor(group.product_id, next)}
                    onQtyChange={setQty}
                  />
                );
              })
            )}
          </section>

          <section className="flex flex-col gap-2.5">
            <SectionHead>Day by day</SectionHead>
            <ol className="flex flex-col gap-2.5">
              {trip.itinerary.map((day) => (
                <li key={day.id} className="flex gap-3 rounded-card border border-ink-200 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-500">
                    {day.day_number}
                  </span>
                  <div>
                    <div className="text-[13px] font-bold text-ink-900">{day.title}</div>
                    {day.description ? (
                      <p className="mt-0.5 text-meta leading-relaxed text-ink-500">{day.description}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* ---------------------------------------------- booking column */}
        <aside className="hidden lg:block">
          <div className="sticky top-4 flex flex-col gap-2.5">
            <div className="overflow-hidden rounded-card border border-ink-200">
              <div className="flex flex-col gap-3 p-4">
                <h3 className="text-[15px] font-bold">Your booking</h3>

                <div className="flex items-center gap-3 rounded-card bg-band px-3 py-2.5">
                  <div className="flex-1">
                    <div className="text-[13px] font-bold">Travellers</div>
                    <div className="text-meta text-ink-400">
                      {money(trip.base_price_cents, trip.currency)} per person
                    </div>
                  </div>
                  <QuantityStepper
                    value={travelers}
                    onChange={setTravelers}
                    min={1}
                    max={trip.spots_left || trip.capacity}
                    label="traveller"
                  />
                </div>

                <hr className="border-ink-200" />

                <BasketLines
                  quote={quote}
                  currency={trip.currency}
                  basePriceCents={trip.base_price_cents}
                />
              </div>

              <PriceBar
                amountCents={quote?.total_cents ?? 0}
                currency={trip.currency}
                hint={
                  pending
                    ? "Updating…"
                    : selectedCount
                      ? `${travelers} travellers · ${selectedCount} add-on${selectedCount > 1 ? "s" : ""}`
                      : `${travelers} travellers · no add-ons yet`
                }
              >
                <Button tone="outline" size="sm">
                  Add to cart
                </Button>
                <Button size="sm" onClick={goToCheckout}>
                  Book now
                </Button>
              </PriceBar>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Chip tone="ok">Free cancellation until 5 Nov</Chip>
              <Chip tone="ok">Instant confirmation</Chip>
            </div>
          </div>
        </aside>
      </div>

      {/* Sticky bar on phones: the total has to stay visible while the
          add-on list scrolls, or people lose track of what they've added. */}
      <div className="fixed inset-x-0 bottom-0 z-20 lg:hidden">
        <PriceBar
          amountCents={quote?.total_cents ?? 0}
          currency={trip.currency}
          hint={pending ? "Updating…" : `${travelers} travellers · incl. add-ons`}
          sticky
        >
          <Button onClick={goToCheckout}>Book now</Button>
        </PriceBar>
      </div>
    </div>
  );
}

/** The itemised basket, straight from the server's quote. */
function BasketLines({
  quote,
  currency,
  basePriceCents,
}: {
  quote: ReturnType<typeof useQuote>["quote"];
  currency: string;
  basePriceCents: number;
}) {
  if (!quote) {
    return <p className="text-meta text-ink-400">Working out your total…</p>;
  }

  return (
    <div className="flex flex-col gap-2 text-[12.5px]">
      <Row
        label={`Base trip · ${money(basePriceCents, currency)} × ${quote.travelers}`}
        value={money(quote.base_total_cents, currency)}
      />
      {quote.addon_lines.map((line) => (
        <Row
          key={line.key}
          label={`${line.label} × ${line.qty}`}
          value={money(line.line_total_cents, currency)}
        />
      ))}
      <Row label="Taxes & fees" value={money(quote.fees_cents, currency)} muted />
      <hr className="border-ink-200" />
      <Row label="Per traveller" value={money(quote.per_traveler_cents, currency)} muted />
    </div>
  );
}

function Row({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={muted ? "text-ink-400" : "text-ink-500"}>{label}</span>
      <span className={`shrink-0 tabular-nums ${muted ? "text-ink-400" : "font-bold text-ink-900"}`}>
        {value}
      </span>
    </div>
  );
}
