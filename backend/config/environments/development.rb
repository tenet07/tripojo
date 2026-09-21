Rails.application.configure do
  config.enable_reloading = true
  config.eager_load = false
  config.consider_all_requests_local = true
  config.server_timing = true

  config.active_support.deprecation = :log

  config.action_controller.raise_on_missing_callback_actions = true

  config.log_level = :debug
end
