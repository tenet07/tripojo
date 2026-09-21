# frozen_string_literal: true

module Api
  module V1
    module Curator
      # The curator's half of the add-on model: deciding which partner tiers
      # are on offer for a trip. Quantities are explicitly not settable here —
      # that is the traveler's half.
      class TripAddOnsController < ApplicationController
        before_action :authenticate_user!
        before_action -> { require_role!("curator") }
        before_action :set_trip

        # Everything on offer for this trip, plus the max basket it implies.
        def index
          render json: {
            trip_add_ons: AddOnSerializer.offer_group(offers),
            max_basket: @trip.max_basket(travelers: travelers_preview).to_h_public
          }
        end

        # The partner catalogue a curator picks from, flagged with what is
        # already attached to this trip.
        def catalogue
          attached = @trip.trip_add_ons.pluck(:add_on_tier_id).to_set
          products = AddOnProduct.active
                                 .includes(:add_on_tiers, :partner_profile)
                                 .then { |scope| params[:category].present? ? scope.in_category(params[:category]) : scope }

          render json: {
            products: products.map { |product| AddOnSerializer.catalogue_entry(product, attached) }
          }
        end

        def create
          trip_add_on = @trip.trip_add_ons.build(trip_add_on_params)
          trip_add_on.position = @trip.trip_add_ons.maximum(:position).to_i + 1 if trip_add_on.position.zero?

          if trip_add_on.save
            render json: { trip_add_on: AddOnSerializer.tier(trip_add_on) }, status: :created
          else
            render json: { errors: trip_add_on.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          trip_add_on = @trip.trip_add_ons.find(params[:id])

          if trip_add_on.update(trip_add_on_params)
            render json: { trip_add_on: AddOnSerializer.tier(trip_add_on) }
          else
            render json: { errors: trip_add_on.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # Switching an add-on off removes the offer outright, so a trip page
        # can never show an option that is no longer purchasable.
        def destroy
          @trip.trip_add_ons.find(params[:id]).destroy!
          head :no_content
        end

        private

        def set_trip
          @trip = current_user.curator_profile.trips.find(params[:trip_id])
        end

        def offers
          @trip.trip_add_ons.includes(add_on_tier: { add_on_product: :partner_profile })
        end

        def travelers_preview
          (params[:travelers] || @trip.capacity).to_i
        end

        def trip_add_on_params
          params.require(:trip_add_on).permit(:add_on_tier_id, :position, :commission_pct, :recommended)
        end
      end
    end
  end
end
