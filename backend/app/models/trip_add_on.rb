# A tier a curator has switched on for a specific trip.
#
# Its existence is the entire "is this offered?" answer — switching an
# add-on off destroys the row rather than flagging it, so a trip page can
# never render an option that is no longer on sale.
class TripAddOn < ApplicationRecord
  belongs_to :trip
  belongs_to :add_on_tier

  delegate :add_on_product, :unit, :price_cents, :label, to: :add_on_tier
  delegate :category, :title, :partner_profile, to: :add_on_product

  validates :add_on_tier_id, uniqueness: { scope: :trip_id, message: "is already offered on this trip" }
  validates :commission_pct, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }

  scope :ordered, -> { order(:position, :id) }

  # What the curator earns if one unit of this is sold.
  def commission_cents
    (price_cents * commission_pct / 100).round
  end

  # Shape the pricing module expects.
  def to_selection(qty)
    {
      key: "tier:#{add_on_tier_id}",
      label: "#{title} — #{label}",
      category: category,
      unit: unit,
      unit_price_cents: price_cents,
      qty: qty
    }
  end
end
