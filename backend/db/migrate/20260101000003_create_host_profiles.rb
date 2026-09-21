class CreateHostProfiles < ActiveRecord::Migration[7.1]
  def change
    create_table :host_profiles do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :business_name, null: false
      t.string :business_type
      t.string :contact_phone
      t.string :verification_status, default: "unverified", null: false
      t.string :verification_doc_url

      t.timestamps
    end
  end
end
