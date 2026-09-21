class CreateCuratorProfiles < ActiveRecord::Migration[7.1]
  def change
    create_table :curator_profiles do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :display_name, null: false
      t.text :bio
      t.string :instagram_handle
      t.string :tiktok_handle
      t.string :youtube_handle
      t.integer :follower_count, default: 0, null: false
      t.string :avatar_url
      t.boolean :verified, default: false, null: false

      t.timestamps
    end
  end
end
