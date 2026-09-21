import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Chip, Photo, Price, Rating, SectionHead, CATEGORY_META } from "../../design-system/klook";
import { compactCount } from "../../lib/money";
import { tripsApi } from "../../lib/tripojoApi";
import type { AddOnCategory, TripCard } from "../../types/addons";

const CATEGORIES: Array<{ key: AddOnCategory | "all"; label: string; icon: string; tint: string }> = [
  { key: "all", label: "All trips", icon: "🧳", tint: "bg-[#FFEAD9]" },
  { key: "local_guide", label: "With a guide", icon: "🧭", tint: CATEGORY_META.local_guide.tint },
  { key: "activity", label: "Activities", icon: "🥾", tint: CATEGORY_META.activity.tint },
  { key: "transport", label: "Transport", icon: "🚕", tint: CATEGORY_META.transport.tint },
  { key: "stay_upgrade", label: "Stay upgrades", icon: "🏨", tint: CATEGORY_META.stay_upgrade.tint },
];

export default function Browse() {
  const [trips, setTrips] = useState<TripCard[]>([]);
  const [category, setCategory] = useState<AddOnCategory | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    tripsApi
      .list(category === "all" ? {} : { category })
      .then(({ trips: found }) => setTrips(found))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="pb-12">
      <Photo
        kind="beach"
        className="flex h-52 items-center justify-center rounded-none px-4 text-center"
      >
        <div className="relative z-[1]">
          <h1 className="text-2xl font-bold text-white drop-shadow sm:text-3xl">
            Go where your feed goes
          </h1>
          <p className="mt-1.5 text-[13px] text-white/90 drop-shadow">
            Small-group trips built by curators — stay, guide, activities and rides in one booking
          </p>
        </div>
      </Photo>

      {/* The category rail doubles as the filter: these are the add-on types
          Tripojo sells, so browsing by them is browsing by what's included. */}
      <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto border-b border-ink-200 px-4 py-4 sm:px-6">
        {CATEGORIES.map((item) => {
          const on = category === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setCategory(item.key)}
              className="flex w-[74px] shrink-0 flex-col items-center gap-1.5"
              aria-pressed={on}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${item.tint} ${
                  on ? "ring-2 ring-brand-500" : ""
                }`}
              >
                {item.icon}
              </span>
              <span className={`text-center text-[11.5px] ${on ? "font-bold text-brand-500" : "text-ink-500"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <SectionHead>
          {category === "all" ? "Travellers' favourite trips" : "Trips including this"}
        </SectionHead>

        {loading ? (
          <p className="mt-6 text-sm text-ink-400">Loading trips…</p>
        ) : trips.length === 0 ? (
          <p className="mt-6 rounded-card bg-band p-4 text-sm text-ink-500">
            No trips with that add-on yet.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                to={`/trips/${trip.slug}`}
                className="flex flex-col overflow-hidden rounded-card border border-ink-200 transition hover:shadow-card"
              >
                <Photo kind={trip.photo ?? "jungle"} className="h-[120px] rounded-none" />
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                  <span className="text-meta text-ink-400">
                    Curated trip · {trip.destination}
                  </span>
                  <h3 className="text-sm font-bold leading-snug">{trip.title}</h3>
                  <div className="flex flex-wrap gap-1">
                    <Chip>{trip.nights} days</Chip>
                    {trip.add_on_categories.slice(0, 2).map((cat) => (
                      <Chip key={cat}>{CATEGORY_META[cat]?.label ?? cat}</Chip>
                    ))}
                  </div>
                  <Rating
                    value={trip.rating}
                    reviews={trip.reviews_count}
                    booked={trip.bookings_count}
                  />
                  <div className="mt-auto pt-1">
                    <Price cents={trip.base_price_cents} currency={trip.currency} from />
                    <p className="mt-0.5 text-meta text-ink-400">
                      by {trip.curator.instagram_handle ?? trip.curator.display_name} ·{" "}
                      {compactCount(trip.curator.follower_count)} followers
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
