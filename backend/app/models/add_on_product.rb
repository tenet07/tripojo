# A partner service that can be attached to a trip: a guided walk, a trek,
# an airport transfer, a room upgrade.
#
# The product holds identity and the charging unit; the money lives on its
# tiers, because a traveler buys a tier ("Full day · 8 hrs"), never the
# product in the abstract.
class AddOnProduct < ApplicationRecord
  belongs_to :partner_profile
  has_many :add_on_tiers, -> { order(:position, :id) }, dependent: :destroy, inverse_of: :add_on_product
  accepts_nested_attributes_for :add_on_tiers, allow_destroy: true

  CATEGORIES = %w[local_guide activity transport stay_upgrade other].freeze
  UNITS = Tripojo::Pricing::UNITS.keys.freeze

  validates :title, presence: true
  validates :category, inclusion: { in: CATEGORIES }
  validates :unit, inclusion: { in: UNITS }
  validate :must_have_at_least_one_tier

  scope :active, -> { where(active: true) }
  scope :in_category, ->(category) { where(category: category) }

  before_validation { self.unit ||= "per_person" }

  def unit_label = Tripojo::Pricing.unit_label(unit)

  def cheapest_tier = add_on_tiers.min_by(&:price_cents)

  def category_label
    category.to_s.tr("_", " ").split.map(&:capitalize).join(" ")
  end

  private

  def must_have_at_least_one_tier
    return if add_on_tiers.reject(&:marked_for_destruction?).any?

    errors.add(:add_on_tiers, "needs at least one priced option")
  end
end
