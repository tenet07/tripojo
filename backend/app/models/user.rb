# A User is any account on the platform. The `role` decides which
# onboarding flow and dashboard they get: curator, host, traveler, admin.
class User < ApplicationRecord
  has_secure_password

  ROLES = %w[curator host partner traveler admin].freeze

  has_one :curator_profile, dependent: :destroy
  has_one :host_profile, dependent: :destroy
  has_one :partner_profile, dependent: :destroy
  has_many :bookings, foreign_key: :traveler_id, inverse_of: :traveler, dependent: :destroy

  before_validation { self.email = email.to_s.downcase.strip }

  validates :name, presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false },
                     format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, inclusion: { in: ROLES }
  validates :password, length: { minimum: 8 }, if: -> { new_record? || !password.nil? }

  after_create :create_role_profile!

  def curator? = role == "curator"
  def host? = role == "host"
  def partner? = role == "partner"
  def traveler? = role == "traveler"
  def admin? = role == "admin"

  # Whichever profile this user's role hangs its onboarding state off.
  def role_profile
    return curator_profile if curator?
    return host_profile if host?
    return partner_profile if partner?

    nil
  end

  def onboarding_complete?
    profile = role_profile
    return true if profile.nil?

    profile.onboarding_complete?
  end

  def onboarding_step
    role_profile&.onboarding_step || "done"
  end

  private

  # Every curator/host gets an (initially empty) profile the moment they
  # sign up, so the onboarding wizard always has a record to fill in.
  def create_role_profile!
    case role
    when "curator"
      create_curator_profile!(display_name: name)
    when "host"
      create_host_profile!(business_name: "#{name}'s Property")
    when "partner"
      create_partner_profile!(business_name: "#{name}'s Services")
    end
  end
end
