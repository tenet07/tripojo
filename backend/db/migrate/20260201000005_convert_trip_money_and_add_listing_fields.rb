# Trips move to integer minor units like everything else in the pricing
# path, and pick up the fields the public trip page needs.
#
# `price_per_person` (a decimal) is converted and dropped rather than
# kept alongside: two representations of the same money is how rounding
# bugs get in.
class ConvertTripMoneyAndAddListingFields < ActiveRecord::Migration[7.1]
  def up
    add_column :trips, :base_price_cents, :integer
    add_column :trips, :currency, :string, null: false, default: "INR"
    add_column :trips, :slug, :string
    add_column :trips, :summary, :text
    add_column :trips, :rating_cache, :decimal, precision: 3, scale: 2
    add_column :trips, :reviews_count, :integer, null: false, default: 0
    add_column :trips, :bookings_count, :integer, null: false, default: 0

    # Decimal rupees -> integer paise.
    execute <<~SQL.squish
      UPDATE trips SET base_price_cents = CAST(ROUND(price_per_person * 100) AS INTEGER)
    SQL

    change_column_null :trips, :base_price_cents, false
    remove_column :trips, :price_per_person

    add_index :trips, :slug, unique: true
    add_index :trips, :status
  end

  def down
    add_column :trips, :price_per_person, :decimal, precision: 10, scale: 2
    execute "UPDATE trips SET price_per_person = base_price_cents / 100.0"
    change_column_null :trips, :price_per_person, false

    remove_index :trips, :status
    remove_index :trips, :slug
    remove_column :trips, :bookings_count
    remove_column :trips, :reviews_count
    remove_column :trips, :rating_cache
    remove_column :trips, :summary
    remove_column :trips, :slug
    remove_column :trips, :currency
    remove_column :trips, :base_price_cents
  end
end
