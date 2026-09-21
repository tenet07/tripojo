class CreateBookings < ActiveRecord::Migration[7.1]
  def change
    create_table :bookings do |t|
      t.references :trip, null: false, foreign_key: true
      t.references :traveler, null: false, foreign_key: { to_table: :users }
      t.integer :travelers_count, null: false, default: 1
      t.string :status, default: "pending", null: false
      t.decimal :deposit_amount, precision: 10, scale: 2
      t.decimal :total_amount, precision: 10, scale: 2

      t.timestamps
    end
  end
end
