# A booking now has to carry a breakdown, not a single total: the base
# trip, the add-ons, and fees are three different pots of money that get
# paid out to different people on different schedules.
class ReworkBookingTotals < ActiveRecord::Migration[7.1]
  def up
    add_column :bookings, :currency, :string, null: false, default: "INR"
    add_column :bookings, :base_total_cents, :integer, null: false, default: 0
    add_column :bookings, :addons_total_cents, :integer, null: false, default: 0
    add_column :bookings, :fees_cents, :integer, null: false, default: 0
    add_column :bookings, :total_cents, :integer, null: false, default: 0
    add_column :bookings, :reference, :string
    add_column :bookings, :lead_traveler_name, :string
    add_column :bookings, :lead_traveler_email, :string
    add_column :bookings, :lead_traveler_phone, :string

    execute <<~SQL.squish
      UPDATE bookings SET total_cents = CAST(ROUND(COALESCE(total_amount, 0) * 100) AS INTEGER)
    SQL

    remove_column :bookings, :total_amount
    remove_column :bookings, :deposit_amount

    add_index :bookings, :reference, unique: true
    add_index :bookings, :status
  end

  def down
    add_column :bookings, :total_amount, :decimal, precision: 10, scale: 2
    add_column :bookings, :deposit_amount, :decimal, precision: 10, scale: 2
    execute "UPDATE bookings SET total_amount = total_cents / 100.0"

    remove_index :bookings, :status
    remove_index :bookings, :reference
    %i[lead_traveler_phone lead_traveler_email lead_traveler_name reference
       total_cents fees_cents addons_total_cents base_total_cents currency].each do |col|
      remove_column :bookings, col
    end
  end
end
