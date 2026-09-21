class CreateRoomTypes < ActiveRecord::Migration[7.1]
  def change
    create_table :room_types do |t|
      t.references :property, null: false, foreign_key: true
      t.string :name, null: false
      t.string :room_kind, default: "dorm", null: false
      t.integer :capacity, null: false
      t.decimal :price_per_night, precision: 10, scale: 2, null: false
      t.integer :total_units, null: false

      t.timestamps
    end
  end
end
