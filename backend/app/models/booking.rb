# A traveler buying a trip plus whichever add-ons they chose.
#
# Totals are recalculated from the lines rather than trusted from the
# client — the request may say the basket is ₹500, the lines decide.
class Booking < ApplicationRecord
  belongs_to :trip
  belongs_to :traveler, class_name: "User", inverse_of: :bookings
  has_many :booking_add_ons, dependent: :destroy
  has_many :add_on_tiers, through: :booking_add_ons
  accepts_nested_attributes_for :booking_add_ons

  STATUSES = %w[pending confirmed cancelled completed].freeze

  validates :travelers_count, numericality: { only_integer: true, greater_than: 0 }
  validates :status, inclusion: { in: STATUSES }
  validates :lead_traveler_name, :lead_traveler_email, presence: true
  validate :within_capacity, on: :create

  before_validation :set_defaults
  before_save :recalculate_totals

  scope :active, -> { where(status: %w[pending confirmed]) }

  # Build a booking straight from a set of {tier_id => qty} selections,
  # pricing every line off the tier as it stands right now.
  def self.build_from_selections(trip:, traveler:, travelers_count:, selections: {}, lead: {})
    booking = new(
      trip: trip,
      traveler: traveler,
      travelers_count: travelers_count,
      currency: trip.currency,
      lead_traveler_name: lead[:name] || traveler&.name,
      lead_traveler_email: lead[:email] || traveler&.email,
      lead_traveler_phone: lead[:phone]
    )

    offered = trip.trip_add_ons.includes(add_on_tier: :add_on_product).index_by(&:add_on_tier_id)

    selections.each do |tier_id, qty|
      qty = qty.to_i
      next if qty <= 0

      offer = offered[tier_id.to_i]
      # Silently ignoring an unoffered tier would let a client buy an add-on
      # the curator never put on this trip.
      raise ActiveRecord::RecordInvalid, booking if offer.nil?

      booking.booking_add_ons.build(add_on_tier: offer.add_on_tier, qty: qty)
    end

    booking
  end

  def quote
    Tripojo::Pricing.quote(
      base_price_cents: trip.base_price_cents,
      travelers: travelers_count,
      currency: currency,
      selections: booking_add_ons.reject(&:marked_for_destruction?).map do |line|
        {
          key: "tier:#{line.add_on_tier_id}",
          label: line.add_on_tier&.label,
          category: line.add_on_tier&.category,
          unit: line.unit || line.add_on_tier&.unit,
          unit_price_cents: line.unit_price_cents || line.add_on_tier&.price_cents,
          qty: line.qty
        }
      end
    )
  end

  private

  def set_defaults
    self.status ||= "pending"
    self.currency ||= trip&.currency || "INR"
    self.reference ||= "TRP-#{SecureRandom.alphanumeric(8).upcase}"
  end

  def recalculate_totals
    computed = quote
    self.base_total_cents   = computed.base_total_cents
    self.addons_total_cents = computed.addons_total_cents
    self.fees_cents         = computed.fees_cents
    self.total_cents        = computed.total_cents
  end

  def within_capacity
    return if trip.blank? || travelers_count.blank?
    return if travelers_count <= trip.spots_left

    errors.add(:travelers_count, "is more than the #{trip.spots_left} spots left on this trip")
  end
end
