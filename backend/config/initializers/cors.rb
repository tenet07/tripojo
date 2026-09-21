# FRONTEND_ORIGINS is a comma-separated list, e.g.
#   https://tripojo.pages.dev,https://tripojo.com
extra_origins = ENV.fetch("FRONTEND_ORIGINS", "").split(",").map(&:strip).reject(&:empty?)

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "http://localhost:5173", "http://127.0.0.1:5173", *extra_origins

    resource "*",
      headers: :any,
      methods: %i[get post put patch delete options head]
  end
end
