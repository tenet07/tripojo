# frozen_string_literal: true

class TripSerializer
  # Compact shape for grids and lists — everything a trip card renders and
  # nothing it doesn't.
  def self.card(trip)
    curator = trip.curator_profile
    {
      id: trip.id,
      slug: trip.slug,
      title: trip.title,
      destination: trip.destination,
      summary: trip.summary,
      start_date: trip.start_date,
      end_date: trip.end_date,
      nights: trip.nights,
      base_price_cents: trip.base_price_cents,
      currency: trip.currency,
      capacity: trip.capacity,
      spots_left: trip.spots_left,
      status: trip.status,
      cover_image_url: trip.cover_image_url,
      rating: trip.rating_cache&.to_f,
      reviews_count: trip.reviews_count,
      bookings_count: trip.bookings_count,
      add_on_categories: trip.trip_add_ons.map { |o| o.category }.uniq,
      curator: {
        id: curator.id,
        display_name: curator.display_name,
        instagram_handle: curator.instagram_handle,
        follower_count: curator.follower_count,
        avatar_url: curator.avatar_url
      }
    }
  end

  # Full shape for the trip page: card data plus itinerary and the add-on
  # groups the traveler picks from.
  def self.detail(trip)
    card(trip).merge(
      description: trip.description,
      itinerary: trip.trip_activities.map do |activity|
        {
          id: activity.id,
          day_number: activity.day_number,
          title: activity.title,
          description: activity.description
        }
      end,
      add_ons: AddOnSerializer.offer_group(
        trip.trip_add_ons.includes(add_on_tier: { add_on_product: :partner_profile })
      )
    )
  end
end
