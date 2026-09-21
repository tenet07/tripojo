# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_02_01_000007) do
  create_table "add_on_products", force: :cascade do |t|
    t.integer "partner_profile_id", null: false
    t.string "category", null: false
    t.string "title", null: false
    t.text "description"
    t.string "unit", default: "per_person", null: false
    t.string "hero_image_url"
    t.string "city"
    t.boolean "active", default: true, null: false
    t.decimal "rating_cache", precision: 3, scale: 2
    t.integer "reviews_count", default: 0, null: false
    t.integer "bookings_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active", "category"], name: "index_add_on_products_on_active_and_category"
    t.index ["category"], name: "index_add_on_products_on_category"
    t.index ["partner_profile_id"], name: "index_add_on_products_on_partner_profile_id"
  end

  create_table "add_on_tiers", force: :cascade do |t|
    t.integer "add_on_product_id", null: false
    t.string "label", null: false
    t.integer "price_cents", null: false
    t.string "currency", default: "INR", null: false
    t.integer "max_capacity"
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["add_on_product_id", "position"], name: "index_add_on_tiers_on_add_on_product_id_and_position"
    t.index ["add_on_product_id"], name: "index_add_on_tiers_on_add_on_product_id"
  end

  create_table "booking_add_ons", force: :cascade do |t|
    t.integer "booking_id", null: false
    t.integer "add_on_tier_id", null: false
    t.integer "qty", default: 1, null: false
    t.integer "unit_price_cents", null: false
    t.integer "line_total_cents", null: false
    t.string "unit", null: false
    t.string "status", default: "pending", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["add_on_tier_id"], name: "index_booking_add_ons_on_add_on_tier_id"
    t.index ["booking_id", "add_on_tier_id"], name: "index_booking_add_ons_on_booking_id_and_add_on_tier_id", unique: true
    t.index ["booking_id"], name: "index_booking_add_ons_on_booking_id"
    t.index ["status"], name: "index_booking_add_ons_on_status"
  end

  create_table "bookings", force: :cascade do |t|
    t.integer "trip_id", null: false
    t.integer "traveler_id", null: false
    t.integer "travelers_count", default: 1, null: false
    t.string "status", default: "pending", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "currency", default: "INR", null: false
    t.integer "base_total_cents", default: 0, null: false
    t.integer "addons_total_cents", default: 0, null: false
    t.integer "fees_cents", default: 0, null: false
    t.integer "total_cents", default: 0, null: false
    t.string "reference"
    t.string "lead_traveler_name"
    t.string "lead_traveler_email"
    t.string "lead_traveler_phone"
    t.index ["reference"], name: "index_bookings_on_reference", unique: true
    t.index ["status"], name: "index_bookings_on_status"
    t.index ["traveler_id"], name: "index_bookings_on_traveler_id"
    t.index ["trip_id"], name: "index_bookings_on_trip_id"
  end

  create_table "curator_profiles", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "display_name", null: false
    t.text "bio"
    t.string "instagram_handle"
    t.string "tiktok_handle"
    t.string "youtube_handle"
    t.integer "follower_count", default: 0, null: false
    t.string "avatar_url"
    t.boolean "verified", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_curator_profiles_on_user_id", unique: true
  end

  create_table "host_profiles", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "business_name", null: false
    t.string "business_type"
    t.string "contact_phone"
    t.string "verification_status", default: "unverified", null: false
    t.string "verification_doc_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_host_profiles_on_user_id", unique: true
  end

  create_table "partner_profiles", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "business_name", null: false
    t.string "primary_category"
    t.string "phone"
    t.string "city"
    t.text "bio"
    t.string "avatar_url"
    t.string "verification_status", default: "unverified", null: false
    t.string "verification_doc_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_partner_profiles_on_user_id", unique: true
    t.index ["verification_status"], name: "index_partner_profiles_on_verification_status"
  end

  create_table "properties", force: :cascade do |t|
    t.integer "host_profile_id", null: false
    t.string "name", null: false
    t.string "property_type", default: "hostel", null: false
    t.string "address", null: false
    t.string "city", null: false
    t.string "country", null: false
    t.text "description"
    t.string "status", default: "draft", null: false
    t.string "cover_image_url"
    t.json "amenities", default: []
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["host_profile_id"], name: "index_properties_on_host_profile_id"
  end

  create_table "room_types", force: :cascade do |t|
    t.integer "property_id", null: false
    t.string "name", null: false
    t.string "room_kind", default: "dorm", null: false
    t.integer "capacity", null: false
    t.decimal "price_per_night", precision: 10, scale: 2, null: false
    t.integer "total_units", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["property_id"], name: "index_room_types_on_property_id"
  end

  create_table "trip_activities", force: :cascade do |t|
    t.integer "trip_id", null: false
    t.integer "day_number", null: false
    t.string "title", null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["trip_id"], name: "index_trip_activities_on_trip_id"
  end

  create_table "trip_add_ons", force: :cascade do |t|
    t.integer "trip_id", null: false
    t.integer "add_on_tier_id", null: false
    t.integer "position", default: 0, null: false
    t.decimal "commission_pct", precision: 5, scale: 2, default: "0.0", null: false
    t.boolean "recommended", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["add_on_tier_id"], name: "index_trip_add_ons_on_add_on_tier_id"
    t.index ["trip_id", "add_on_tier_id"], name: "index_trip_add_ons_on_trip_id_and_add_on_tier_id", unique: true
    t.index ["trip_id"], name: "index_trip_add_ons_on_trip_id"
  end

  create_table "trips", force: :cascade do |t|
    t.integer "curator_profile_id", null: false
    t.string "title", null: false
    t.string "destination", null: false
    t.text "description"
    t.date "start_date", null: false
    t.date "end_date", null: false
    t.integer "capacity", null: false
    t.string "status", default: "draft", null: false
    t.string "cover_image_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "base_price_cents", null: false
    t.string "currency", default: "INR", null: false
    t.string "slug"
    t.text "summary"
    t.decimal "rating_cache", precision: 3, scale: 2
    t.integer "reviews_count", default: 0, null: false
    t.integer "bookings_count", default: 0, null: false
    t.index ["curator_profile_id"], name: "index_trips_on_curator_profile_id"
    t.index ["slug"], name: "index_trips_on_slug", unique: true
    t.index ["status"], name: "index_trips_on_status"
  end

  create_table "users", force: :cascade do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "role", default: "traveler", null: false
    t.string "phone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "add_on_products", "partner_profiles"
  add_foreign_key "add_on_tiers", "add_on_products"
  add_foreign_key "booking_add_ons", "add_on_tiers"
  add_foreign_key "booking_add_ons", "bookings"
  add_foreign_key "bookings", "trips"
  add_foreign_key "bookings", "users", column: "traveler_id"
  add_foreign_key "curator_profiles", "users"
  add_foreign_key "host_profiles", "users"
  add_foreign_key "partner_profiles", "users"
  add_foreign_key "properties", "host_profiles"
  add_foreign_key "room_types", "properties"
  add_foreign_key "trip_activities", "trips"
  add_foreign_key "trip_add_ons", "add_on_tiers"
  add_foreign_key "trip_add_ons", "trips"
  add_foreign_key "trips", "curator_profiles"
end
