# A guide, activity operator or transport provider — the owner of the
# add-on products curators attach to their trips.
class PartnerProfile < ApplicationRecord
  belongs_to :user
  has_many :add_on_products, dependent: :destroy

  VERIFICATION_STATUSES = %w[unverified pending verified].freeze

  validates :business_name, presence: true
  validates :verification_status, inclusion: { in: VERIFICATION_STATUSES }
  validates :primary_category, inclusion: { in: AddOnProduct::CATEGORIES }, allow_blank: true

  before_validation { self.verification_status ||= "unverified" }

  def verified? = verification_status == "verified"

  # Mirrors the curator/host wizards: a partner is set up once they have a
  # category, have submitted verification, and have something to sell.
  def onboarding_complete?
    business_name.present? && primary_category.present? &&
      verification_status != "unverified" && add_on_products.exists?
  end

  def onboarding_step
    return "business_info" if business_name.blank? || primary_category.blank?
    return "verification" if verification_status == "unverified"
    return "first_product" unless add_on_products.exists?

    "done"
  end
end
