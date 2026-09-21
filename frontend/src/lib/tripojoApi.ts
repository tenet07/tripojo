// Typed wrappers over the endpoints this feature uses. Every path here
// exists identically in the Rails router and in mock-api/server.mjs, so
// switching VITE_API_BASE_URL between them changes nothing else.

import { api } from "./api";
import type {
  Booking,
  CatalogueProduct,
  CuratorTrip,
  Quote,
  Selections,
  TripCard,
  TripDetail,
} from "../types/addons";

export const tripsApi = {
  list: (params: { destination?: string; category?: string } = {}) => {
    const search = new URLSearchParams();
    if (params.destination) search.set("destination", params.destination);
    if (params.category) search.set("category", params.category);
    const qs = search.toString();
    return api.get<{ trips: TripCard[] }>(`/trips${qs ? `?${qs}` : ""}`);
  },

  get: (slug: string) => api.get<{ trip: TripDetail }>(`/trips/${slug}`),

  /**
   * Ask the server what this basket costs. The client never adds prices up
   * itself, so what's on screen and what gets charged cannot drift apart.
   */
  quote: (slug: string, travelers: number, selections: Selections) =>
    api.post<{ quote: Quote }>(`/trips/${slug}/quote`, { travelers, selections }),

  book: (
    slug: string,
    payload: {
      travelers: number;
      selections: Selections;
      lead: { name: string; email: string; phone?: string };
    },
  ) => api.post<{ booking: Booking }>(`/trips/${slug}/bookings`, payload),
};

export const curatorApi = {
  trips: () => api.get<{ trips: CuratorTrip[] }>("/curator/trips"),

  addOns: (tripId: number | string) =>
    api.get<{ trip_add_ons: CuratorTrip["add_ons"]; max_basket: Quote }>(
      `/curator/trips/${tripId}/add_ons`,
    ),

  catalogue: (tripId: number | string, category?: string) => {
    const qs = category ? `?category=${encodeURIComponent(category)}` : "";
    return api.get<{ products: CatalogueProduct[] }>(
      `/curator/trips/${tripId}/add_ons/catalogue${qs}`,
    );
  },

  attach: (tripId: number | string, tierId: number, commissionPct = 10) =>
    api.post<unknown>(`/curator/trips/${tripId}/add_ons`, {
      trip_add_on: { add_on_tier_id: tierId, commission_pct: commissionPct },
    }),

  detach: (tripId: number | string, tripAddOnId: number) =>
    api.delete<void>(`/curator/trips/${tripId}/add_ons/${tripAddOnId}`),

  updateOffer: (
    tripId: number | string,
    tripAddOnId: number,
    changes: { commission_pct?: number; recommended?: boolean },
  ) =>
    api.patch<unknown>(`/curator/trips/${tripId}/add_ons/${tripAddOnId}`, {
      trip_add_on: changes,
    }),
};
