module Api
  module V1
    module Curator
      class TripsController < ApplicationController
        before_action :authenticate_user!
        before_action { require_role!("curator") }
        before_action :set_trip, only: %i[show update destroy]

        # GET /api/v1/curator/trips
        def index
          trips = current_user.curator_profile.trips
                              .includes(:trip_activities, :trip_add_ons)
                              .order(created_at: :desc)
          render json: { trips: trips.map { |trip| serialize(trip) } }
        end

        # GET /api/v1/curator/trips/:id
        def show
          render json: { trip: serialize(@trip) }
        end

        # POST /api/v1/curator/trips
        def create
          trip = current_user.curator_profile.trips.build(trip_params)

          if trip.save
            render json: { trip: serialize(trip) }, status: :created
          else
            render json: { errors: trip.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # PATCH /api/v1/curator/trips/:id
        def update
          if @trip.update(trip_params)
            render json: { trip: serialize(@trip) }
          else
            render json: { errors: @trip.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # DELETE /api/v1/curator/trips/:id
        def destroy
          @trip.destroy
          head :no_content
        end

        private

        def set_trip
          @trip = current_user.curator_profile.trips
                              .includes(:trip_activities, trip_add_ons: { add_on_tier: { add_on_product: :partner_profile } })
                              .find(params[:id])
        end

        # A curator's own view of a trip carries the add-ons they've put on
        # offer and the ceiling basket those imply, which is what the trip
        # builder renders.
        def serialize(trip)
          TripSerializer.detail(trip).merge(
            max_basket: trip.max_basket(travelers: trip.capacity).to_h_public
          )
        end

        def trip_params
          params.permit(
            :title, :destination, :description, :summary, :start_date, :end_date,
            :base_price_cents, :currency, :capacity, :status, :cover_image_url,
            trip_activities_attributes: %i[id day_number title description _destroy]
          )
        end
      end
    end
  end
end
