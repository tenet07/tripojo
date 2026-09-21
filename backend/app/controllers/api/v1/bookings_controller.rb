# frozen_string_literal: true

module Api
  module V1
    # Creating a booking out of a trip plus the add-ons a traveler chose.
    class BookingsController < ApplicationController
      before_action :authenticate_user!

      def create
        trip = Trip.published.find_by(slug: params[:trip_id]) || Trip.published.find(params[:trip_id])

        booking = Booking.build_from_selections(
          trip: trip,
          traveler: current_user,
          travelers_count: params[:travelers].to_i,
          selections: selection_params,
          lead: lead_params
        )

        if booking.save
          render json: { booking: serialize(booking) }, status: :created
        else
          render json: { errors: booking.errors.full_messages }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordInvalid
        render json: { errors: ["One of those add-ons isn't offered on this trip"] },
               status: :unprocessable_entity
      rescue Tripojo::Pricing::Error => e
        render json: { errors: [e.message] }, status: :unprocessable_entity
      end

      def show
        booking = current_user.bookings.includes(booking_add_ons: { add_on_tier: :add_on_product })
                              .find_by!(reference: params[:id])
        render json: { booking: serialize(booking) }
      end

      def index
        bookings = current_user.bookings.includes(:trip).order(created_at: :desc)
        render json: { bookings: bookings.map { |booking| serialize(booking) } }
      end

      private

      def serialize(booking)
        {
          reference: booking.reference,
          status: booking.status,
          travelers_count: booking.travelers_count,
          currency: booking.currency,
          base_total_cents: booking.base_total_cents,
          addons_total_cents: booking.addons_total_cents,
          fees_cents: booking.fees_cents,
          total_cents: booking.total_cents,
          lead_traveler: {
            name: booking.lead_traveler_name,
            email: booking.lead_traveler_email,
            phone: booking.lead_traveler_phone
          },
          trip: TripSerializer.card(booking.trip),
          add_ons: booking.booking_add_ons.map do |line|
            {
              id: line.id,
              tier_id: line.add_on_tier_id,
              title: line.title,
              label: line.add_on_tier.label,
              category: line.category,
              unit: line.unit,
              qty: line.qty,
              unit_price_cents: line.unit_price_cents,
              line_total_cents: line.line_total_cents,
              status: line.status
            }
          end
        }
      end

      def selection_params
        raw = params[:selections]
        return {} if raw.blank?

        raw.respond_to?(:to_unsafe_h) ? raw.to_unsafe_h : raw.to_h
      end

      def lead_params
        lead = params[:lead] || {}
        {
          name: lead[:name],
          email: lead[:email],
          phone: lead[:phone]
        }
      end
    end
  end
end
