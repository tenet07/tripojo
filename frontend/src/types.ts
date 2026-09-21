export type Role = "curator" | "host" | "partner" | "traveler" | "admin";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  onboarding_complete: boolean;
  onboarding_step: string;
}

export interface CuratorProfile {
  id: number;
  display_name: string;
  bio: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  youtube_handle: string | null;
  follower_count: number;
  avatar_url: string | null;
  verified: boolean;
  onboarding_complete: boolean;
  onboarding_step: "profile" | "socials" | "first_trip" | "done";
}

export interface TripActivity {
  id?: number;
  day_number: number;
  title: string;
  description?: string;
  _destroy?: boolean;
}

export interface Trip {
  id: number;
  title: string;
  destination: string;
  description: string | null;
  start_date: string;
  end_date: string;
  /** Minor units (paise). See lib/money.ts — the client never stores floats. */
  base_price_cents: number;
  currency: string;
  capacity: number;
  status: "draft" | "published";
  cover_image_url: string | null;
  trip_activities: TripActivity[];
}

export interface HostProfile {
  id: number;
  business_name: string;
  business_type: string | null;
  contact_phone: string | null;
  verification_status: "unverified" | "pending" | "verified";
  verification_doc_url: string | null;
  onboarding_complete: boolean;
  onboarding_step: "business_info" | "verification" | "first_property" | "done";
}

export interface RoomType {
  id?: number;
  name: string;
  room_kind: "dorm" | "private" | "entire_place";
  capacity: number;
  price_per_night: string | number;
  total_units: number;
  _destroy?: boolean;
}

export interface Property {
  id: number;
  name: string;
  property_type: string;
  address: string;
  city: string;
  country: string;
  description: string | null;
  status: "draft" | "pending_review" | "live";
  cover_image_url: string | null;
  amenities: string[];
  room_types: RoomType[];
  from_price?: number | null;
  total_capacity?: number;
}
