# A bookable unit within a Property, e.g. "6-bed mixed dorm" or
# "Private double room".
class RoomType < ApplicationRecord
  belongs_to :property, inverse_of: :room_types

  KINDS = %w[dorm private entire_place].freeze

  validates :name, presence: true
  validates :capacity, :total_units, numericality: { only_integer: true, greater_than: 0 }
  validates :price_per_night, numericality: { greater_than: 0 }
  validates :room_kind, inclusion: { in: KINDS }

  before_validation { self.room_kind ||= "dorm" }
end
