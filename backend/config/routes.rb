Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      post "auth/signup", to: "auth#signup"
      post "auth/login",  to: "auth#login"
      get  "auth/me",     to: "auth#me"

      # --- Public, traveler-facing discovery ---
      resources :trips, only: %i[index show] do
        member do
          # The server is the pricing authority; the client asks it for a
          # basket rather than adding numbers up itself.
          post :quote
        end
        resources :bookings, only: %i[create]
      end
      resources :bookings, only: %i[index show], param: :id

      namespace :curator do
        resource :profile, only: %i[show update]
        resources :trips do
          resources :add_ons, only: %i[index create update destroy],
                              controller: "trip_add_ons" do
            collection do
              get :catalogue
            end
          end
        end
      end

      namespace :host do
        resource :profile, only: %i[show update]
        resources :properties
      end

      namespace :partner do
        resource :profile, only: %i[show update]
        resources :add_on_products
      end
    end
  end
end
