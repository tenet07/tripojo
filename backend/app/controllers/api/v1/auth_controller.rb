module Api
  module V1
    class AuthController < ApplicationController
      # POST /api/v1/auth/signup
      # Creates the account and its role profile (curator/host), and logs
      # the user straight in with a token so the frontend can drop them
      # right into the onboarding wizard.
      def signup
        user = User.new(signup_params)

        if user.save
          render json: auth_payload(user), status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/auth/login
      def login
        user = User.find_by(email: params[:email].to_s.downcase.strip)

        if user&.authenticate(params[:password])
          render json: auth_payload(user)
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      # GET /api/v1/auth/me
      def me
        authenticate_user!
        render json: user_json(current_user) if current_user
      end

      private

      def signup_params
        params.permit(:name, :email, :password, :role)
      end

      def auth_payload(user)
        { token: JsonWebToken.encode(user_id: user.id), user: user_json(user) }
      end

      def user_json(user)
        user.as_json(only: %i[id name email role]).merge(
          onboarding_complete: user.onboarding_complete?,
          onboarding_step: user.onboarding_step
        )
      end
    end
  end
end
