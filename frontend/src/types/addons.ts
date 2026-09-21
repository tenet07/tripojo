// Mirrors the Rails serializers field-for-field. Money is always an integer
// of minor units alongside a currency — never a float, never a string.

export type AddOnCategory =
  | "local_guide"
  | "activity"
  | "transport"
  | "stay_upgrade"
  | "other";

/** What a quantity actually counts. Decided by the partner, not the UI. */
export type AddOnUnit = "per_person" | "per_group" | "per_vehicle" | "per_night";

export interface PartnerRef {
  id: number;
  name: string;
  verified: boolean;
}

/** One priced option of an add-on, as offered on a specific trip. */
export interface AddOnTier {
  trip_add_on_id: number;
  tier_id: number;
  label: string;
  price_cents: number;
  currency: string;
  max_capacity: number | null;
  recommended: boolean;
  commission_pct: number;
}

/** An add-on product with every tier the curator switched on. */
export interface AddOnGroup {
  product_id: number;
  category: AddOnCategory;
  category_label: string;
  title: string;
  description: string | null;
  unit: AddOnUnit;
  unit_label: string;
  hero_image_url: string | null;
  rating: number | null;
  reviews_count: number;
  bookings_count: number;
  partner: PartnerRef;
  tiers: AddOnTier[];
}

/** A tier in the catalogue a curator browses, flagged if already attached. */
export interface CatalogueTier {
  tier_id: number;
  label: string;
  price_cents: number;
  currency: string;
  max_capacity: number | null;
  attached: boolean;
}

export interface CatalogueProduct {
  product_id: number;
  category: AddOnCategory;
  category_label: string;
  title: string;
  description: string | null;
  unit: AddOnUnit;
  unit_label: string;
  city: string | null;
  rating: number | null;
  reviews_count: number;
  partner: PartnerRef;
  tiers: CatalogueTier[];
}

export interface QuoteLine {
  key: string;
  label: string | null;
  category: string | null;
  unit: AddOnUnit;
  unit_price_cents: number;
  qty: number;
  line_total_cents: number;
}

/** Everything the UI displays about price. The client computes none of it. */
export interface Quote {
  currency: string;
  travelers: number;
  base_unit_price_cents: number;
  base_total_cents: number;
  addon_lines: QuoteLine[];
  addons_total_cents: number;
  subtotal_cents: number;
  fees_cents: number;
  total_cents: number;
  per_traveler_cents: number;
}

export interface CuratorRef {
  id: number;
  display_name: string;
  instagram_handle: string | null;
  follower_count: number;
  avatar_url: string | null;
}

export interface TripCard {
  id: number;
  slug: string;
  title: string;
  destination: string;
  summary: string | null;
  start_date: string;
  end_date: string;
  nights: number;
  base_price_cents: number;
  currency: string;
  capacity: number;
  spots_left: number;
  status: "draft" | "published";
  cover_image_url: string | null;
  /** Stand-in photo key until real uploads land. */
  photo?: string;
  rating: number | null;
  reviews_count: number;
  bookings_count: number;
  add_on_categories: AddOnCategory[];
  curator: CuratorRef;
}

export interface ItineraryDay {
  id: number;
  day_number: number;
  title: string;
  description: string | null;
}

export interface TripDetail extends TripCard {
  description: string | null;
  itinerary: ItineraryDay[];
  add_ons: AddOnGroup[];
}

export interface CuratorTrip extends TripDetail {
  max_basket: Quote;
}

export interface BookingAddOnLine {
  id: number;
  tier_id: number;
  title: string;
  label: string;
  category: string;
  unit: AddOnUnit;
  qty: number;
  unit_price_cents: number;
  line_total_cents: number;
  status: string;
}

export interface Booking {
  reference: string;
  status: string;
  travelers_count: number;
  currency: string;
  base_total_cents: number;
  addons_total_cents: number;
  fees_cents: number;
  total_cents: number;
  lead_traveler: { name: string; email: string; phone: string | null };
  trip: TripCard;
  add_ons: BookingAddOnLine[];
}

/** tier_id -> quantity. The traveler's half of the model. */
export type Selections = Record<number, number>;
