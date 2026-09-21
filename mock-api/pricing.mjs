// A line-for-line port of backend/app/lib/tripojo/pricing.rb.
//
// It exists so the frontend can run before Rails is installed. Because the
// two implementations have to agree to the paise, `npm run check:pricing`
// diffs this against the Ruby original over a shared set of cases.
//
// Same rules as the Ruby: money is an integer in the currency's minor unit,
// fees are basis points, and no Float ever touches a money value.

export const UNITS = {
  per_person: 'per person',
  per_group: 'per group',
  per_vehicle: 'per vehicle',
  per_night: 'per night',
};

export const DEFAULT_FEE_BPS = 500;

export class PricingError extends Error {}

const castMoney = (value, field) => {
  if (!Number.isInteger(value)) {
    throw new PricingError(`${field} must be an integer number of minor units, got ${JSON.stringify(value)}`);
  }
  if (value < 0) throw new PricingError(`${field} cannot be negative`);
  return value;
};

const castCount = (value, field) => {
  if (!Number.isInteger(value)) {
    throw new PricingError(`${field} must be a whole number, got ${JSON.stringify(value)}`);
  }
  if (value < 0) throw new PricingError(`${field} cannot be negative`);
  return value;
};

// Ruby's Integer#/ floors; JS division does not. Every division here is
// explicitly floored so the two implementations round identically.
export const fee = (subtotalCents, feeBps = DEFAULT_FEE_BPS) => {
  if (subtotalCents <= 0 || feeBps <= 0) return 0;
  return Math.floor((subtotalCents * feeBps + 5000) / 10000);
};

const divideRound = (numerator, denominator) => {
  if (denominator === 0) return 0;
  return Math.floor((numerator + Math.floor(denominator / 2)) / denominator);
};

export const validUnit = (unit) => Object.prototype.hasOwnProperty.call(UNITS, String(unit));

export const unitLabel = (unit) => UNITS[String(unit)] ?? String(unit).replace(/_/g, ' ');

export const naturalQty = (unit, travelers) => (String(unit) === 'per_person' ? travelers : 1);

const buildLine = (raw) => {
  const qty = castCount(raw.qty, 'qty');
  if (qty === 0) return null;

  const unit = String(raw.unit);
  if (!validUnit(unit)) throw new PricingError(`unknown unit "${unit}"`);

  const unitPriceCents = castMoney(raw.unit_price_cents, 'unit_price_cents');

  return {
    key: raw.key ?? null,
    label: raw.label ?? null,
    category: raw.category ?? null,
    unit,
    unit_price_cents: unitPriceCents,
    qty,
    line_total_cents: unitPriceCents * qty,
  };
};

export function quote({
  base_price_cents,
  travelers,
  selections = [],
  currency = 'INR',
  fee_bps = DEFAULT_FEE_BPS,
}) {
  const travelerCount = castCount(travelers, 'travelers');
  if (travelerCount < 1) throw new PricingError('travelers must be at least 1');

  const basePriceCents = castMoney(base_price_cents, 'base_price_cents');
  const baseTotalCents = basePriceCents * travelerCount;

  const lines = (selections ?? []).map(buildLine).filter(Boolean);
  const addonsTotalCents = lines.reduce((sum, line) => sum + line.line_total_cents, 0);

  const subtotalCents = baseTotalCents + addonsTotalCents;
  const feesCents = fee(subtotalCents, fee_bps);
  const totalCents = subtotalCents + feesCents;

  return {
    currency,
    travelers: travelerCount,
    base_unit_price_cents: basePriceCents,
    base_total_cents: baseTotalCents,
    addon_lines: lines,
    addons_total_cents: addonsTotalCents,
    subtotal_cents: subtotalCents,
    fees_cents: feesCents,
    total_cents: totalCents,
    per_traveler_cents: divideRound(totalCents, travelerCount),
  };
}

export function maxBasket({ base_price_cents, travelers, offers = [], currency = 'INR', fee_bps = DEFAULT_FEE_BPS }) {
  const selections = offers.map((offer) => ({ ...offer, qty: naturalQty(offer.unit, travelers) }));
  return quote({ base_price_cents, travelers, selections, currency, fee_bps });
}
