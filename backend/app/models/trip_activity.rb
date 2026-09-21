# One line item of a Trip's itinerary: "Day 2 - Sunrise trek + waterfall".
class TripActivity < ApplicationRecord
  belongs_to :trip, inverse_of: :trip_activities

  validates :day_number, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :title, presence: true
end
