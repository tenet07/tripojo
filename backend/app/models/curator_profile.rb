# Step-by-step onboarding state for a social-media travel curator.
class CuratorProfile < ApplicationRecord
  belongs_to :user
  has_many :trips, dependent: :destroy

  validates :display_name, presence: true
  validates :follower_count, numericality: { greater_than_or_equal_to: 0 }

  # Onboarding is "done" once the curator has a real bio, at least one
  # linked social handle, and has published their first trip.
  def onboarding_complete?
    display_name.present? && bio.present? && any_social_handle? && trips.exists?
  end

  def onboarding_step
    return "profile" if display_name.blank? || bio.blank?
    return "socials" unless any_social_handle?
    return "first_trip" unless trips.exists?

    "done"
  end

  private

  def any_social_handle?
    instagram_handle.present? || tiktok_handle.present? || youtube_handle.present?
  end
end
