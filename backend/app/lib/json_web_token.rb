# Minimal JWT wrapper used for stateless auth between the React frontend
# and this API. Set TRIPOJO_JWT_SECRET in production; the fallback below
# is fine for local development only.
class JsonWebToken
  SECRET_KEY = ENV.fetch("TRIPOJO_JWT_SECRET", "tripojo_dev_secret_change_me")

  def self.encode(payload, exp = 30.days.from_now)
    payload = payload.dup
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY)
  end

  def self.decode(token)
    return nil if token.blank?

    decoded = JWT.decode(token, SECRET_KEY)[0]
    ActiveSupport::HashWithIndifferentAccess.new(decoded)
  rescue JWT::ExpiredSignature, JWT::DecodeError
    nil
  end
end
