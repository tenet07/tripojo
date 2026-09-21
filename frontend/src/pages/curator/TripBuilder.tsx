import { useCallback, useEffect, useState } from "react";
import { Button, Chip, PriceBar, Rating, SectionHead, CategoryTile } from "../../design-system/klook";
import { money } from "../../lib/money";
import { curatorApi } from "../../lib/tripojoApi";
import type { CatalogueProduct, CuratorTrip, Quote } from "../../types/addons";

/**
 * The curator's half of the add-on model: deciding which partner packages
 * are on offer, and at what price.
 *
 * There is deliberately no quantity control anywhere on this screen. A
 * curator sets availability; the traveler sets how many. Mixing the two is
 * what made the first version of this design confusing.
 */
export default function TripBuilder() {
  const [trip, setTrip] = useState<CuratorTrip | null>(null);
  const [catalogue, setCatalogue] = useState<CatalogueProduct[]>([]);
  const [maxBasket, setMaxBasket] = useState<Quote | null>(null);
  const [busyTier, setBusyTier] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { trips } = await curatorApi.trips();
    const current = trips[0];
    if (!current) return;
    setTrip(current);
    setMaxBasket(current.max_basket);
    const { products } = await curatorApi.catalogue(current.id);
    setCatalogue(products);
  }, []);

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
  }, [load]);

  /** Attached tier -> the trip_add_on row that would have to be deleted. */
  const attachedRowFor = (tierId: number) => {
    if (!trip) return null;
    for (const group of trip.add_ons) {
      const tier = group.tiers.find((t) => t.tier_id === tierId);
      if (tier) return tier.trip_add_on_id;
    }
    return null;
  };

  async function toggleTier(tierId: number) {
    if (!trip) return;
    setBusyTier(tierId);
    setError(null);
    try {
      const rowId = attachedRowFor(tierId);
      if (rowId) await curatorApi.detach(trip.id, rowId);
      else await curatorApi.attach(trip.id, tierId);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyTier(null);
    }
  }

  if (!trip) {
    return <div className="px-4 py-24 text-center text-sm text-ink-400">Loading your trip…</div>;
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-xl font-bold">{trip.title}</h1>
          <p className="mt-1 text-[13px] text-ink-500">
            {trip.start_date} – {trip.end_date} · max {trip.capacity} travellers ·{" "}
            {money(trip.base_price_cents, trip.currency)} base per traveller
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <div>
            <SectionHead>Add-on partners</SectionHead>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">
              Switch a package on to offer it on this trip. Travellers choose the quantity
              themselves — you decide what's available and at what price.
            </p>
          </div>

          {error ? <p className="text-[12.5px] text-alert-500">{error}</p> : null}

          {catalogue.map((product) => (
            <article
              key={product.product_id}
              className="flex flex-col gap-3 rounded-card border border-ink-200 p-3.5"
              data-testid={`catalogue-${product.category}`}
            >
              <div className="flex items-start gap-3">
                <CategoryTile category={product.category} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Chip tone="brand">{product.category_label}</Chip>
                  <h3 className="text-sm font-bold">{product.title}</h3>
                  <p className="text-meta text-ink-400">
                    {product.partner.name} · charged {product.unit_label}
                    {product.city ? ` · ${product.city}` : ""}
                  </p>
                  <Rating value={product.rating} reviews={product.reviews_count} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {product.tiers.map((tier) => (
                  <div
                    key={tier.tier_id}
                    className={`flex items-center gap-3 rounded-card px-3.5 py-2.5 transition
                      ${tier.attached ? "bg-brand-50" : "bg-band"}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-bold text-ink-900">{tier.label}</div>
                      <div className="mt-0.5 text-meta text-ink-400">
                        {money(tier.price_cents, tier.currency)} {product.unit_label}
                        {tier.max_capacity ? ` · seats ${tier.max_capacity}` : ""}
                      </div>
                    </div>

                    <span className="text-meta text-ink-400">
                      {tier.attached ? "On offer" : "Off"}
                    </span>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={tier.attached}
                      aria-label={`${tier.attached ? "Remove" : "Offer"} ${product.title} — ${tier.label}`}
                      disabled={busyTier === tier.tier_id}
                      onClick={() => toggleTier(tier.tier_id)}
                      data-testid={`toggle-${tier.tier_id}`}
                      className={`relative h-[22px] w-10 shrink-0 rounded-full transition disabled:opacity-50
                        ${tier.attached ? "bg-brand-500" : "bg-ink-200"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-all
                          ${tier.attached ? "left-5" : "left-0.5"}`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>

      <aside className="flex flex-col gap-2.5">
        <div className="sticky top-4 flex flex-col gap-2.5">
          <div className="overflow-hidden rounded-card border border-ink-200">
            <div className="flex flex-col gap-2.5 p-4">
              <h3 className="text-[15px] font-bold">What a traveller will pay</h3>
              <p className="text-meta text-ink-400">
                Ceiling for a group of {trip.capacity}, with every add-on taken
              </p>
              <hr className="border-ink-200" />

              {maxBasket ? (
                <div className="flex flex-col gap-2 text-[12.5px]">
                  <Row
                    label={`Base trip × ${maxBasket.travelers}`}
                    value={money(maxBasket.base_total_cents, maxBasket.currency)}
                  />
                  {maxBasket.addon_lines.map((line) => (
                    <Row
                      key={line.key}
                      label={`${line.label} × ${line.qty}`}
                      value={money(line.line_total_cents, maxBasket.currency)}
                    />
                  ))}
                  {maxBasket.addon_lines.length === 0 ? (
                    <p className="text-meta text-ink-400">No add-ons offered yet.</p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <PriceBar
              amountCents={maxBasket?.total_cents ?? 0}
              currency={maxBasket?.currency ?? "INR"}
              hint="Max basket per group"
            >
              <Button size="sm">Publish</Button>
            </PriceBar>
          </div>

          <div className="rounded-card border border-brand-100 bg-brand-50 p-3.5">
            <p className="text-[11.5px] leading-relaxed text-ink-700">
              <b>Your cut:</b> the full base trip price, plus the commission you set on each add-on.
              Partners are paid their own rate directly.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-ink-500">{label}</span>
      <span className="shrink-0 font-bold tabular-nums text-ink-900">{value}</span>
    </div>
  );
}
