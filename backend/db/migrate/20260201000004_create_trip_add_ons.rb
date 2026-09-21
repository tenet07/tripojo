# The curator's side of the deal: which add-on tiers are on offer for a
# given trip, in what order, and what cut the curator takes.
#
# The split this table enforces: a curator decides WHAT is available and
# at WHAT price; the traveler decides HOW MANY. Neither can set the
# other's half.
class CreateTripAddOns < ActiveRecord::Migration[7.1]
  def change
    create_table :trip_add_ons do |t|
      t.references :trip, null: false, foreign_key: true
      t.references :add_on_tier, null: false, foreign_key: true
      t.integer :position, null: false, default: 0
      t.decimal :commission_pct, precision: 5, scale: 2, null: false, default: 0
      t.boolean :recommended, null: false, default: false

      t.timestamps
    end

    # A tier can only be offered once per trip.
    add_index :trip_add_ons, %i[trip_id add_on_tier_id], unique: true
  end
end
