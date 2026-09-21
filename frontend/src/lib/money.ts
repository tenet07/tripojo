// The only place in the client that knows how to turn minor units into
// something a person reads. The API always sends integers plus a currency;
// nothing else in the app should be doing arithmetic on money.

const FORMATTERS = new Map<string, Intl.NumberFormat>();

function formatter(currency: string, withDecimals: boolean) {
  const key = `${currency}:${withDecimals}`;
  let found = FORMATTERS.get(key);
  if (!found) {
    found = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: withDecimals ? 2 : 0,
      maximumFractionDigits: withDecimals ? 2 : 0,
    });
    FORMATTERS.set(key, found);
  }
  return found;
}

/**
 * Display a minor-unit integer. Whole amounts drop the decimals — ₹19,050
 * rather than ₹19,050.00 — because every price in this product is whole
 * rupees and the trailing zeros are noise.
 */
export function money(cents: number | null | undefined, currency = "INR"): string {
  if (cents == null) return "—";
  const major = cents / 100;
  return formatter(currency, !Number.isInteger(major)).format(major);
}

/** Compact social proof: 3040 -> "3K+", 128400 -> "128K". */
export function compactCount(value: number | null | undefined): string {
  if (!value) return "0";
  if (value < 1000) return String(value);
  if (value < 1_000_000) {
    const k = value / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

/** 1194 -> "1,194" for review counts, which are shown exactly. */
export function count(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("en-IN");
}
