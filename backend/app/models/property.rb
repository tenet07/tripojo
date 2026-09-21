# A listing owned by a host: a hostel, hotel or homestay with one or more
# room types travelers/curators can book against.
class Property < ApplicationRecord
  belongs_to :host_profile
  has_many :room_types, dependent: :destroy, inverse_of: :property
  accepts_nested_attributes_for :room_types, allow_destroy: true

  STATUSES = %w[draft pending_review live].freeze

  validates :name, :address, :city, :country, presence: true
  validates :status, inclusion: { in: STATUSES }

  before_validation { self.status ||= "draft" }
  before_validation { self.amenities ||= [] }

  def total_capacity
    room_types.sum { |rt| rt.total_units.to_i * rt.capacity.to_i }
  end

  def from_price
    room_types.minimum(:price_per_night)
  end
end
