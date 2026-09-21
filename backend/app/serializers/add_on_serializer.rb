# frozen_string_literal: true

# Shapes add-on data for the client. Money always leaves the API as an
# integer of minor units plus a currency — formatting is the client's job,
# so there is exactly one place that knows ₹ from $.
class AddOnSerializer
  # An add-on as offered on a trip: the product's identity, the partner
  # behind it, and every tier the curator switched on.
  def self.offer_group(trip_add_ons)
    trip_add_ons
      .group_by(&:add_on_product)
      .map do |product, offers|
        partner = product.partner_profile
        {
          product_id: product.id,
          category: product.category,
          category_label: product.category_label,
          title: product.title,
          description: product.description,
          unit: product.unit,
          unit_label: product.unit_label,
          hero_image_url: product.hero_image_url,
          rating: product.rating_cache&.to_f,
          reviews_count: product.reviews_count,
          bookings_count: product.bookings_count,
          partner: {
            id: partner.id,
            name: partner.business_name,
            verified: partner.verified?
          },
          tiers: offers.map { |offer| tier(offer) }
        }
      end
  end

  def self.tier(trip_add_on)
    tier = trip_add_on.add_on_tier
    {
      trip_add_on_id: trip_add_on.id,
      tier_id: tier.id,
      label: tier.label,
      price_cents: tier.price_cents,
      currency: tier.currency,
      max_capacity: tier.max_capacity,
      recommended: trip_add_on.recommended,
      commission_pct: trip_add_on.commission_pct.to_f
    }
  end

  # A partner's product in the catalogue a curator browses, annotated with
  # whether it is already on this trip.
  def self.catalogue_entry(product, attached_tier_ids)
    {
      product_id: product.id,
      category: product.category,
      category_label: product.category_label,
      title: product.title,
      description: product.description,
      unit: product.unit,
      unit_label: product.unit_label,
      city: product.city,
      rating: product.rating_cache&.to_f,
      reviews_count: product.reviews_count,
      partner: {
        id: product.partner_profile.id,
        name: product.partner_profile.business_name,
        verified: product.partner_profile.verified?
      },
      tiers: product.add_on_tiers.map do |tier|
        {
          tier_id: tier.id,
          label: tier.label,
          price_cents: tier.price_cents,
          currency: tier.currency,
          max_capacity: tier.max_capacity,
          attached: attached_tier_ids.include?(tier.id)
        }
      end
    }
  end
end
