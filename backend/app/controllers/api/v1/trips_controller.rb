# frozen_string_literal: true

module Api
  module V1
    # Public, unauthenticated trip discovery — the traveler side of the app.
    class TripsController < ApplicationController
      def index
        trips = Trip.published
                    .includes(:curator_profile, :trip_add_ons)
                    .in_destination(params[:destination])
        trips = filter_by_category(trips)
        trips = filter_by_price(trips)

        render json: { trips: trips.map { |trip| TripSerializer.card(trip) } }
      end

      def show
        render json: { trip: TripSerializer.detail(find_trip!) }
      end

      # The pricing authority. The client sends what the traveler picked and
      # gets back every number it should display — it never does the maths
      # itself, so the basket on screen and the basket charged cannot drift.
      def quote
        trip = find_trip!
        computed = trip.quote_for(
          travelers: params[:travelers] || 1,
          selections: selection_params
        )

        render json: { quote: computed.to_h_public }
      rescue Tripojo::Pricing::Error => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      private

      # Trips are addressed by slug in the UI, but an id still works so
      # internal tools and tests don't have to know the slug.
      def find_trip!
        @find_trip ||= Trip.published.find_by(slug: params[:id]) ||
                       Trip.published.find(params[:id])
      end

      # { selections: { "12" => 2, "15" => 1 } }
      def selection_params
        raw = params[:selections]
        return {} if raw.blank?

        raw.respond_to?(:to_unsafe_h) ? raw.to_unsafe_h : raw.to_h
      end

      def filter_by_category(scope)
        return scope if params[:category].blank?

        scope.joins(trip_add_ons: { add_on_tier: :add_on_product })
             .where(add_on_products: { category: params[:category] })
             .distinct
      end

      def filter_by_price(scope)
        scope = scope.where(base_price_cents: (params[:min_price_cents].to_i)..) if params[:min_price_cents].present?
        scope = scope.where(base_price_cents: ..(params[:max_price_cents].to_i)) if params[:max_price_cents].present?
        scope
      end
    end
  end
end
