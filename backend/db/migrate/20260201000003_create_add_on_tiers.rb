# A priced option within an add-on product: "Half day · 4 hrs" at one
# price, "Full day · 8 hrs" at another. This is the row a traveler
# actually buys, which is why price lives here and not on the product.
#
# Money is stored in the currency's minor unit (paise for INR) as an
# integer. No floats anywhere in the pricing path.
class CreateAddOnTiers < ActiveRecord::Migration[7.1]
  def change
    create_table :add_on_tiers do |t|
      t.references :add_on_product, null: false, foreign_key: true
      t.string :label, null: false
      t.integer :price_cents, null: false
      t.string :currency, null: false, default: "INR"
      t.integer :max_capacity
      t.integer :position, null: false, default: 0

      t.timestamps
    end

    add_index :add_on_tiers, %i[add_on_product_id position]
  end
end
