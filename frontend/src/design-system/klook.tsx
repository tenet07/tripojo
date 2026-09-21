// The Klook-patterned primitives: the small set of parts every screen in
// this product is assembled from. Each one mirrors a specific pattern from
// the wireframes rather than being a generic UI kit.

import type { ReactNode } from "react";
import { money, count, compactCount } from "../lib/money";
import type { AddOnCategory } from "../types/addons";

/* ------------------------------------------------------------------ chips */

type ChipTone = "neutral" | "ok" | "alert" | "brand" | "trust";

const CHIP_TONES: Record<ChipTone, string> = {
  neutral: "border border-ink-200 text-ink-500",
  ok: "bg-ok-50 text-ok-500 font-bold",
  alert: "bg-alert-50 text-alert-500 font-bold",
  brand: "bg-brand-50 text-brand-500 font-bold",
  trust: "bg-trust-50 text-trust-500 font-bold",
};

export function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: ChipTone }) {
  // w-fit matters: a chip inside a flex column would otherwise stretch to
  // the full width of the card and stop reading as a chip at all.
  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded px-2 py-0.5 text-chip ${CHIP_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------- rating */

/**
 * Star, rating, exact review count, rounded booked count — in that order,
 * because that is the order a traveler's eye needs them to build trust.
 * The star is amber, never the brand orange, so it can't be mistaken for
 * something clickable.
 */
export function Rating({
  value,
  reviews,
  booked,
  className = "",
}: {
  value: number | null;
  reviews?: number;
  booked?: number;
  className?: string;
}) {
  if (value == null) return null;
  return (
    <div className={`flex flex-wrap items-center gap-1.5 text-meta text-ink-400 ${className}`}>
      <span className="text-star">★</span>
      <b className="text-[12.5px] font-bold text-star">{value.toFixed(1)}</b>
      {reviews ? <span>({count(reviews)})</span> : null}
      {booked ? <span>· {compactCount(booked)}+ booked</span> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ price */

export function Price({
  cents,
  currency = "INR",
  from = false,
  strike,
  size = "md",
}: {
  cents: number;
  currency?: string;
  from?: boolean;
  strike?: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "text-sm", md: "text-base", lg: "text-xl" };
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className={`font-bold tabular-nums text-ink-900 ${sizes[size]}`}>
        {from ? <span className="text-[11px] font-normal text-ink-500">From </span> : null}
        {money(cents, currency)}
      </span>
      {strike ? <s className="text-[11px] text-ink-400">{money(strike, currency)}</s> : null}
    </span>
  );
}

/* --------------------------------------------------------------- buttons */

type ButtonTone = "solid" | "outline" | "quiet";

const BUTTON_TONES: Record<ButtonTone, string> = {
  solid: "bg-brand-500 text-white border-transparent hover:bg-brand-600",
  outline: "bg-surface text-brand-500 border-brand-500 hover:bg-brand-50",
  quiet: "bg-surface text-ink-500 border-ink-200 hover:bg-band",
};

export function Button({
  children,
  tone = "solid",
  size = "md",
  block = false,
  ...rest
}: {
  children: ReactNode;
  tone?: ButtonTone;
  size?: "sm" | "md";
  block?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const pad = size === "sm" ? "px-3.5 py-1.5 text-xs" : "px-5 py-2.5 text-[13px]";
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border-[1.5px] font-bold transition
        disabled:cursor-not-allowed disabled:opacity-50 ${pad} ${BUTTON_TONES[tone]} ${block ? "w-full" : ""} ${rest.className ?? ""}`}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------- package pills */

/**
 * Klook's option selector. Picking a pill sets the unit price; it never
 * sets a quantity — that separation is the whole add-on model.
 */
export function PackagePills<T extends { tier_id: number; label: string; price_cents: number; currency: string }>({
  tiers,
  selectedId,
  onSelect,
  badgeFor,
}: {
  tiers: T[];
  selectedId: number | null;
  onSelect: (tierId: number) => void;
  badgeFor?: (tier: T) => string | null;
}) {
  if (tiers.length <= 1) return null;
  return (
    <div className="flex flex-wrap gap-2.5 pt-0.5">
      {tiers.map((tier) => {
        const on = tier.tier_id === selectedId;
        const badge = badgeFor?.(tier);
        return (
          <button
            key={tier.tier_id}
            type="button"
            onClick={() => onSelect(tier.tier_id)}
            aria-pressed={on}
            className={`relative rounded-pill border-[1.5px] px-4 py-2 text-[12.5px] transition
              ${on ? "border-brand-500 font-bold text-brand-500" : "border-ink-200 text-ink-900 hover:border-ink-300"}`}
          >
            {tier.label} · {money(tier.price_cents, tier.currency)}
            {badge ? (
              <span className="absolute -right-1.5 -top-2 rounded bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                {badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------- stepper */

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  const button = "flex h-[26px] w-[26px] items-center justify-center rounded-full border-[1.5px] text-[15px] leading-none transition disabled:opacity-40";
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        className={`${button} border-ink-200 text-ink-500`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Remove one ${label ?? "item"}`}
      >
        −
      </button>
      <span className="min-w-[14px] text-center text-[13px] font-bold tabular-nums">{value}</span>
      <button
        type="button"
        className={`${button} border-brand-500 text-brand-500`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Add one ${label ?? "item"}`}
      >
        +
      </button>
    </div>
  );
}

/* ------------------------------------------------------------ price bar */

/**
 * The bar that ends every buying surface: total on the left with a line of
 * context under it, actions on the right.
 */
export function PriceBar({
  amountCents,
  currency = "INR",
  hint,
  children,
  sticky = false,
}: {
  amountCents: number;
  currency?: string;
  hint?: string;
  children?: ReactNode;
  sticky?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3.5 border-t border-ink-200 bg-band px-4 py-3.5
        ${sticky ? "sticky bottom-0 z-10 shadow-bar" : "rounded-b-card"}`}
    >
      <div>
        <div className="text-xl font-bold leading-tight tabular-nums text-ink-900" data-testid="price-total">
          {money(amountCents, currency)}
        </div>
        {hint ? <div className="mt-0.5 text-meta text-ink-400">{hint}</div> : null}
      </div>
      <div className="ml-auto flex gap-2">{children}</div>
    </div>
  );
}

/* --------------------------------------------------------- misc layout */

export function SectionHead({ children }: { children: ReactNode }) {
  return <h2 className="section-head">{children}</h2>;
}

export function Photo({
  kind = "grey",
  className = "",
  caption,
  children,
}: {
  kind?: string;
  className?: string;
  caption?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={`photo photo-${kind} ${className}`}>
      {children}
      {caption ? (
        <div className="absolute bottom-0 left-0 z-[1] p-3 text-[13px] font-bold text-white drop-shadow">
          {caption}
        </div>
      ) : null}
    </div>
  );
}

export const CATEGORY_META: Record<AddOnCategory, { icon: string; tint: string; label: string }> = {
  local_guide: { icon: "🧭", tint: "bg-[#EDE6FF]", label: "Local guide" },
  activity: { icon: "🥾", tint: "bg-[#FFF3D1]", label: "Activity" },
  transport: { icon: "🚕", tint: "bg-[#DDEEFF]", label: "Transport" },
  stay_upgrade: { icon: "🏨", tint: "bg-[#DFF3E6]", label: "Stay upgrade" },
  other: { icon: "✨", tint: "bg-[#FFE2E2]", label: "Other" },
};

export function CategoryTile({ category, size = 40 }: { category: AddOnCategory; size?: number }) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.other;
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl ${meta.tint}`}
      style={{ width: size, height: size, fontSize: size * 0.48 }}
      aria-hidden
    >
      {meta.icon}
    </div>
  );
}
