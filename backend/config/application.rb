require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Tripojo
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.1

    # API-only mode: no views, no cookie/session middleware, JSON-first.
    # Auth is stateless JWT (see app/lib/json_web_token.rb), so no cookie
    # middleware is needed.
    config.api_only = true
  end
end
