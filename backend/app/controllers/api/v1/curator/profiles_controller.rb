module Api
  module V1
    module Curator
      class ProfilesController < ApplicationController
        before_action :authenticate_user!
        before_action { require_role!("curator") }

        # GET /api/v1/curator/profile
        def show
          render json: profile_json(current_user.curator_profile)
        end

        # PATCH /api/v1/curator/profile
        def update
          profile = current_user.curator_profile

          if profile.update(profile_params)
            render json: profile_json(profile)
          else
            render json: { errors: profile.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def profile_params
          params.permit(
            :display_name, :bio, :instagram_handle, :tiktok_handle,
            :youtube_handle, :follower_count, :avatar_url
          )
        end

        def profile_json(profile)
          profile.as_json.merge(
            onboarding_complete: profile.onboarding_complete?,
            onboarding_step: profile.onboarding_step
          )
        end
      end
    end
  end
end
