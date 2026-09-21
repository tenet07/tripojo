# What a traveler actually bought, and what it cost them at the moment
# they bought it.
#
# unit_price_cents is copied off the tier rather than read through it.
# A partner raising their price next month must not silently rewrite a
# booking that is already paid for.
class CreateBookingAddOns < ActiveRecord::Migration[7.1]
  def change
    create_table :booking_add_ons do |t|
      t.references :booking, null: false, foreign_key: true
      t.references :add_on_tier, null: false, foreign_key: true
      t.integer :qty, null: false, default: 1
      t.integer :unit_price_cents, null: false
      t.integer :line_total_cents, null: false
      t.string :unit, null: false
      t.string :status, null: false, default: "pending"

      t.timestamps
    end

    add_index :booking_add_ons, %i[booking_id add_on_tier_id], unique: true
    add_index :booking_add_ons, :status
  end
end
