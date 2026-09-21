import { CATEGORY_META, Chip, PackagePills, QuantityStepper, Rating } from "../design-system/klook";
import { money } from "../lib/money";
import type { AddOnGroup, AddOnUnit } from "../types/addons";

/**
 * One add-on, the way a traveler buys it: pick a package, then say how many.
 *
 * The unit is doing real work in the copy here. "4 × per person" and
 * "1 × per vehicle" are both quantity 1-to-many, but they mean different
 * things, and a traveler who misreads that overpays. So the unit is spelled
 * out next to the stepper rather than left implicit.
 */

function unitHelp(unit: AddOnUnit, travelers: number): string {
  switch (unit) {
    case "per_person":
      return `How many of your ${travelers} travellers want this`;
    case "per_vehicle":
      return "How many vehicles";
    case "per_night":
      return "How many nights";
    case "per_group":
    default:
      return "How many";
  }
}

export function AddOnPicker({
  group,
  travelers,
  selectedTierId,
  qty,
  onSelectTier,
  onQtyChange,
}: {
  group: AddOnGroup;
  travelers: number;
  selectedTierId: number;
  qty: number;
  onSelectTier: (tierId: number) => void;
  onQtyChange: (tierId: number, qty: number) => void;
}) {
  const meta = CATEGORY_META[group.category] ?? CATEGORY_META.other;
  const tier = group.tiers.find((t) => t.tier_id === selectedTierId) ?? group.tiers[0];
  const lineTotal = tier ? tier.price_cents * qty : 0;

  // A "up to 6" vehicle can't carry nine people; warn rather than silently
  // let someone book a car too small for their group.
  const capacityShortfall =
    tier?.max_capacity && (group.unit === "per_vehicle" || group.unit === "per_group")
      ? qty * tier.max_capacity < travelers && qty > 0
      : false;

  return (
    <article className="flex flex-col gap-3 rounded-card border border-ink-200 p-3.5" data-testid={`addon-${group.category}`}>
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[19px] ${meta.tint}`}
          aria-hidden
        >
          {meta.icon}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Chip tone="brand">{group.category_label}</Chip>
          <h3 className="text-sm font-bold text-ink-900">{group.title}</h3>
          <p className="text-meta text-ink-400">
            by {group.partner.name}
            {group.partner.verified ? " · Verified partner" : ""}
          </p>
          <Rating value={group.rating} reviews={group.reviews_count} booked={group.bookings_count} />
          {group.description ? (
            <p className="mt-1 text-xs leading-relaxed text-ink-500">{group.description}</p>
          ) : null}
        </div>
      </div>

      <PackagePills
        tiers={group.tiers}
        selectedId={tier?.tier_id ?? null}
        onSelect={(tierId) => onSelectTier(tierId)}
        badgeFor={(t) => (group.tiers.find((x) => x.tier_id === t.tier_id)?.recommended ? "Popular" : null)}
      />

      <div className={`flex items-center gap-3 rounded-card bg-band px-3.5 py-3 ${qty === 0 ? "opacity-95" : ""}`}>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold text-ink-900">{tier?.label}</div>
          <div className="mt-0.5 text-meta text-ink-400">
            {money(tier?.price_cents ?? 0, tier?.currency)} {group.unit_label} · {unitHelp(group.unit, travelers)}
          </div>
        </div>

        <QuantityStepper
          value={qty}
          onChange={(next) => onQtyChange(tier!.tier_id, next)}
          max={group.unit === "per_person" ? travelers : 20}
          label={group.title}
        />

        <span
          className={`min-w-[74px] text-right text-[13px] tabular-nums ${qty ? "font-bold text-ink-900" : "text-ink-400"}`}
          data-testid={`line-total-${group.category}`}
        >
          {qty ? money(lineTotal, tier?.currency) : "—"}
        </span>
      </div>

      {capacityShortfall ? (
        <p className="text-meta text-alert-500">
          {tier?.label} seats {tier?.max_capacity}. You'll need {Math.ceil(travelers / (tier?.max_capacity || 1))} for {travelers} travellers.
        </p>
      ) : null}
    </article>
  );
}
