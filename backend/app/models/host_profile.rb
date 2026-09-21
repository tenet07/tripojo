# Step-by-step onboarding state for a hostel / hotel / homestay host.
class HostProfile < ApplicationRecord
  belongs_to :user
  has_many :properties, dependent: :destroy

  VERIFICATION_STATUSES = %w[unverified pending verified].freeze
  BUSINESS_TYPES = %w[hostel hotel homestay guesthouse other].freeze

  validates :business_name, presence: true
  validates :verification_status, inclusion: { in: VERIFICATION_STATUSES }

  def onboarding_complete?
    business_name.present? && business_type.present? && properties.exists?
  end

  def onboarding_step
    return "business_info" if business_type.blank?
    return "verification" if verification_status == "unverified"
    return "first_property" unless properties.exists?

    "done"
  end
end
