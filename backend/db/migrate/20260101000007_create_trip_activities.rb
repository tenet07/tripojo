class CreateTripActivities < ActiveRecord::Migration[7.1]
  def change
    create_table :trip_activities do |t|
      t.references :trip, null: false, foreign_key: true
      t.integer :day_number, null: false
      t.string :title, null: false
      t.text :description

      t.timestamps
    end
  end
end
