class CreateAnalyticsKeys < ActiveRecord::Migration
  def self.up
    create_table :analytics_keys do |t|
      t.string :site_uid
      t.string :key
      t.string :nickname

      t.timestamps
    end
    add_index :analytics_keys, :site_uid
    add_index :analytics_keys, :nickname
    
    create_table :analytics_keys_page_objects, :id => false do |t|
      t.references :analytics_key
      t.references :page_object
    end
    add_index :analytics_keys_page_objects, :analytics_key_id
    add_index :analytics_keys_page_objects, :page_object_id
  end

  def self.down
    drop_table :analytics_keys_page_objects
    drop_table :analytics_keys
  end
end
