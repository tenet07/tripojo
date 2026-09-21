# A curated group trip: dates, base price, capacity, a day-by-day
# itinerary, and the add-on tiers the curator has put on offer.
class Trip < ApplicationRecord
  belongs_to :curator_profile, inverse_of: :trips
  has_many :trip_activities, -> { order(:day_number) }, dependent: :destroy, inverse_of: :trip
  has_many :bookings, dependent: :destroy
  has_many :trip_add_ons, -> { ordered }, dependent: :destroy, inverse_of: :trip
  has_many :offered_tiers, through: :trip_add_ons, source: :add_on_tier
  accepts_nested_attributes_for :trip_activities, allow_destroy: true

  STATUSES = %w[draft published].freeze

  validates :title, :destination, :start_date, :end_date, presence: true
  validates :base_price_cents, numericality: { only_integer: true, greater_than: 0 }
  validates :capacity, numericality: { only_integer: true, greater_than: 0 }
  validates :status, inclusion: { in: STATUSES }
  validates :slug, uniqueness: true, allow_nil: true
  validate :end_date_after_start_date

  before_validation { self.status ||= "draft" }
  before_validation :assign_slug

  scope :published, -> { where(status: "published") }
  scope :in_destination, ->(q) { where("destination LIKE ?", "%#{q}%") if q.present? }

  def to_param = slug.presence || id.to_s

  def nights = (end_date - start_date).to_i

  def spots_left
    capacity.to_i - bookings.active.sum(:travelers_count)
  end

  # Price a specific set of traveler selections: { tier_id => qty }.
  # Only tiers actually offered on this trip are priced; anything else is
  # dropped rather than quietly charged for.
  def quote_for(travelers:, selections: {})
    offers = trip_add_ons.includes(add_on_tier: :add_on_product).index_by(&:add_on_tier_id)

    lines = selections.filter_map do |tier_id, qty|
      offer = offers[tier_id.to_i]
      next if offer.nil?

      offer.to_selection(qty.to_i)
    end

    Tripojo::Pricing.quote(
      base_price_cents: base_price_cents,
      travelers: travelers,
      currency: currency,
      selections: lines
    )
  end

  # The ceiling a curator is building: every offered add-on taken at its
  # natural quantity for the group.
  def max_basket(travelers: capacity)
    Tripojo::Pricing.max_basket(
      base_price_cents: base_price_cents,
      travelers: travelers,
      currency: currency,
      offers: trip_add_ons.includes(add_on_tier: :add_on_product).map { |o| o.to_selection(0) }
    )
  end

  private

  def assign_slug
    return if slug.present? || title.blank?

    base = "#{title} #{destination}".downcase.gsub(/[^a-z0-9]+/, "-").delete_prefix("-").delete_suffix("-")
    candidate = base
    suffix = 2
    candidate = "#{base}-#{suffix += 1}" while Trip.where(slug: candidate).where.not(id: id).exists?
    self.slug = candidate
  end

  def end_date_after_start_date
    return if end_date.blank? || start_date.blank?

    errors.add(:end_date, "must be after the start date") if end_date < start_date
  end
end
