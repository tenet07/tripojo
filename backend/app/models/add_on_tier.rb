# One priced option of an add-on product. This is the unit of sale: what
# a curator offers on a trip and what a traveler puts a quantity against.
class AddOnTier < ApplicationRecord
  belongs_to :add_on_product
  has_many :trip_add_ons, dependent: :destroy
  has_many :booking_add_ons, dependent: :restrict_with_error

  delegate :unit, :category, :title, :partner_profile, to: :add_on_product

  validates :label, presence: true
  validates :price_cents, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :max_capacity, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true

  def price_rupees = price_cents / 100.0

  # A tier's quantity is capped by capacity where the partner set one — an
  # "up to 3" sedan cannot be sold to five people as a single unit.
  def qty_within_capacity?(qty, travelers)
    return true if max_capacity.blank?
    return true unless unit == "per_group" || unit == "per_vehicle"

    qty * max_capacity >= travelers
  end
end
