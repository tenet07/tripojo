class CreateTrips < ActiveRecord::Migration[7.1]
  def change
    create_table :trips do |t|
      t.references :curator_profile, null: false, foreign_key: true
      t.string :title, null: false
      t.string :destination, null: false
      t.text :description
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.decimal :price_per_person, precision: 10, scale: 2, null: false
      t.integer :capacity, null: false
      t.string :status, default: "draft", null: false
      t.string :cover_image_url

      t.timestamps
    end
  end
end
