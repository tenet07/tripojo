# A service a partner sells that can ride along with a curated trip:
# a guide, an activity, a transfer, a room upgrade.
#
# `unit` is the thing that makes add-ons non-trivial: a guide is charged
# per person, a taxi per vehicle, a room per night. It decides what a
# quantity of 3 actually means, so it lives on the product, not the UI.
class CreateAddOnProducts < ActiveRecord::Migration[7.1]
  def change
    create_table :add_on_products do |t|
      t.references :partner_profile, null: false, foreign_key: true
      t.string :category, null: false
      t.string :title, null: false
      t.text :description
      t.string :unit, null: false, default: "per_person"
      t.string :hero_image_url
      t.string :city
      t.boolean :active, null: false, default: true

      # Denormalised social proof. Cheap to read on every trip page, and
      # recalculated from reviews/bookings rather than written by hand.
      t.decimal :rating_cache, precision: 3, scale: 2
      t.integer :reviews_count, null: false, default: 0
      t.integer :bookings_count, null: false, default: 0

      t.timestamps
    end

    add_index :add_on_products, :category
    add_index :add_on_products, %i[active category]
  end
end
