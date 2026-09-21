module Api
  module V1
    module Host
      class ProfilesController < ApplicationController
        before_action :authenticate_user!
        before_action { require_role!("host") }

        # GET /api/v1/host/profile
        def show
          render json: profile_json(current_user.host_profile)
        end

        # PATCH /api/v1/host/profile
        def update
          profile = current_user.host_profile

          if profile.update(profile_params)
            render json: profile_json(profile)
          else
            render json: { errors: profile.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def profile_params
          # Hosts can only self-report moving into "pending" (they submitted
          # something for review); flipping to "verified" is an admin action
          # that will live in a future admin console, not this endpoint.
          permitted = params.permit(:business_name, :business_type, :contact_phone, :verification_doc_url, :verification_status)
          permitted.delete(:verification_status) if permitted[:verification_status] == "verified"
          permitted
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
