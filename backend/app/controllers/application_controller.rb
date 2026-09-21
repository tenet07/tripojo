class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found

  attr_reader :current_user

  private

  def authenticate_user!
    token = request.headers["Authorization"]&.split(" ")&.last
    decoded = JsonWebToken.decode(token)
    @current_user = User.find_by(id: decoded[:user_id]) if decoded

    render json: { error: "Unauthorized" }, status: :unauthorized unless @current_user
  end

  def require_role!(role)
    return if current_user&.role == role

    render json: { error: "This action requires a #{role} account" }, status: :forbidden
  end

  def render_not_found(exception)
    render json: { error: exception.message }, status: :not_found
  end
end
