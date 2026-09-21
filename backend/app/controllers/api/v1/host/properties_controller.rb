module Api
  module V1
    module Host
      class PropertiesController < ApplicationController
        before_action :authenticate_user!
        before_action { require_role!("host") }
        before_action :set_property, only: %i[show update destroy]

        # GET /api/v1/host/properties
        def index
          properties = current_user.host_profile.properties.order(created_at: :desc)
          render json: properties.as_json(include: :room_types, methods: %i[from_price total_capacity])
        end

        # GET /api/v1/host/properties/:id
        def show
          render json: @property.as_json(include: :room_types, methods: %i[from_price total_capacity])
        end

        # POST /api/v1/host/properties
        def create
          property = current_user.host_profile.properties.build(property_params)

          if property.save
            render json: property.as_json(include: :room_types), status: :created
          else
            render json: { errors: property.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # PATCH /api/v1/host/properties/:id
        def update
          if @property.update(property_params)
            render json: @property.as_json(include: :room_types)
          else
            render json: { errors: @property.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # DELETE /api/v1/host/properties/:id
        def destroy
          @property.destroy
          head :no_content
        end

        private

        def set_property
          @property = current_user.host_profile.properties.find(params[:id])
        end

        def property_params
          params.permit(
            :name, :property_type, :address, :city, :country, :description,
            :status, :cover_image_url, amenities: [],
            room_types_attributes: %i[id name room_kind capacity price_per_night total_units _destroy]
          )
        end
      end
    end
  end
end
