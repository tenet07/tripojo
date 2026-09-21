# A line on a booking. Price and unit are copied here at purchase time
# rather than read through the tier: a partner changing their rate next
# week must not silently restate what someone already paid.
class BookingAddOn < ApplicationRecord
  belongs_to :booking
  belongs_to :add_on_tier

  STATUSES = %w[pending confirmed declined delivered].freeze

  delegate :add_on_product, to: :add_on_tier
  delegate :category, :title, :partner_profile, to: :add_on_product

  validates :qty, numericality: { only_integer: true, greater_than: 0 }
  validates :unit_price_cents, :line_total_cents,
            numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :status, inclusion: { in: STATUSES }

  before_validation :capture_tier_terms, on: :create
  validate :line_total_matches_unit_price

  scope :billable, -> { where.not(status: "declined") }

  private

  def capture_tier_terms
    self.status ||= "pending"
    return if add_on_tier.blank?

    self.unit ||= add_on_tier.unit
    self.unit_price_cents ||= add_on_tier.price_cents
    self.line_total_cents = unit_price_cents.to_i * qty.to_i
  end

  def line_total_matches_unit_price
    return if unit_price_cents.blank? || qty.blank?
    return if line_total_cents == unit_price_cents * qty

    errors.add(:line_total_cents, "must equal unit price x quantity")
  end
end
