# frozen_string_literal: true

module Api
  module V1
    module Partner
      class ProfilesController < ApplicationController
        before_action :authenticate_user!
        before_action -> { require_role!("partner") }

        def show
          render json: { partner_profile: serialize(profile) }
        end

        def update
          if profile.update(profile_params)
            render json: { partner_profile: serialize(profile) }
          else
            render json: { errors: profile.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def profile
          @profile ||= current_user.partner_profile
        end

        def serialize(record)
          {
            id: record.id,
            business_name: record.business_name,
            primary_category: record.primary_category,
            phone: record.phone,
            city: record.city,
            bio: record.bio,
            avatar_url: record.avatar_url,
            verification_status: record.verification_status,
            onboarding_complete: record.onboarding_complete?,
            onboarding_step: record.onboarding_step,
            products_count: record.add_on_products.count
          }
        end

        def profile_params
          permitted = params.require(:partner_profile).permit(
            :business_name, :primary_category, :phone, :city, :bio,
            :avatar_url, :verification_doc_url, :verification_status
          )
          # A partner can submit for review; only an admin flow can actually
          # award the badge.
          permitted.delete(:verification_status) if permitted[:verification_status] == "verified"
          permitted
        end
      end
    end
  end
end
