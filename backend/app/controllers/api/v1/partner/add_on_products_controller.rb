# frozen_string_literal: true

module Api
  module V1
    module Partner
      # A partner's own catalogue: the services curators can attach to trips.
      class AddOnProductsController < ApplicationController
        before_action :authenticate_user!
        before_action -> { require_role!("partner") }

        def index
          products = scope.includes(:add_on_tiers)
          render json: { add_on_products: products.map { |product| serialize(product) } }
        end

        def show
          render json: { add_on_product: serialize(scope.find(params[:id])) }
        end

        def create
          product = scope.build(product_params)

          if product.save
            render json: { add_on_product: serialize(product) }, status: :created
          else
            render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          product = scope.find(params[:id])

          if product.update(product_params)
            render json: { add_on_product: serialize(product) }
          else
            render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          scope.find(params[:id]).destroy!
          head :no_content
        end

        private

        def scope
          current_user.partner_profile.add_on_products
        end

        def serialize(product)
          {
            id: product.id,
            category: product.category,
            category_label: product.category_label,
            title: product.title,
            description: product.description,
            unit: product.unit,
            unit_label: product.unit_label,
            city: product.city,
            active: product.active,
            hero_image_url: product.hero_image_url,
            rating: product.rating_cache&.to_f,
            reviews_count: product.reviews_count,
            tiers: product.add_on_tiers.map do |tier|
              {
                id: tier.id, label: tier.label, price_cents: tier.price_cents,
                currency: tier.currency, max_capacity: tier.max_capacity, position: tier.position
              }
            end,
            # How many curators are currently selling this.
            offered_on_trips: TripAddOn.where(add_on_tier_id: product.add_on_tiers.select(:id)).count
          }
        end

        def product_params
          params.require(:add_on_product).permit(
            :category, :title, :description, :unit, :city, :active, :hero_image_url,
            add_on_tiers_attributes: %i[id label price_cents currency max_capacity position _destroy]
          )
        end
      end
    end
  end
end
