class CreateProperties < ActiveRecord::Migration[7.1]
  def change
    create_table :properties do |t|
      t.references :host_profile, null: false, foreign_key: true
      t.string :name, null: false
      t.string :property_type, default: "hostel", null: false
      t.string :address, null: false
      t.string :city, null: false
      t.string :country, null: false
      t.text :description
      t.string :status, default: "draft", null: false
      t.string :cover_image_url
      t.json :amenities, default: []

      t.timestamps
    end
  end
end
