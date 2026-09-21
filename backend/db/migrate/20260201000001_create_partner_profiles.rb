# Guides, activity operators and transport providers. They are the third
# supply-side role alongside curators and hosts, and the owner of every
# add-on product a curator can attach to a trip.
class CreatePartnerProfiles < ActiveRecord::Migration[7.1]
  def change
    create_table :partner_profiles do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :business_name, null: false
      t.string :primary_category
      t.string :phone
      t.string :city
      t.text :bio
      t.string :avatar_url
      t.string :verification_status, null: false, default: "unverified"
      t.string :verification_doc_url

      t.timestamps
    end

    add_index :partner_profiles, :verification_status
  end
end
