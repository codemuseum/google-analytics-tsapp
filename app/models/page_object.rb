class PageObject < ActiveRecord::Base
  include ThriveSmartObjectMethods
  self.caching_default = :any_page_object_update #[in :forever, :page_object_update, :any_page_object_update, 'data_update[datetimes]', :never, 'interval[5]']

  attr_accessor :added_analytics_keys, :site_wide_analytics_key
  has_and_belongs_to_many :analytics_keys
  
  after_save :save_site_wide_analytics_key
  after_update :save_and_remove_assigned_keys
  
  def validate
    unless self.added_analytics_keys.nil?
      recorded_items_error = false
      self.added_analytics_keys.each do |ak|
        unless ak.valid? or recorded_items_error
          errors.add(:analytics_keys, " have an error that must be corrected.")
        end
      end
    end
  end
  
  # Responsible for removing and adding all analytics_keys to this page_object. The general flow is:
  #  If the analytics_key isn't a part of the analytics_keys array already, save to added_analytics_keys for after_save
  #  If the analytics_key is missing from the array, mark it to be removed for after_save 
  def assigned_analytics_keys=(array_hash)
    # Find new analytics_keys (but no duplicates)
    self.added_analytics_keys = []
    array_hash.each do |h|
      unless analytics_keys.detect { |c| c.id.to_s == h[:id].to_i.to_s } || self.added_analytics_keys.detect { |f| f.id.to_s == h[:id].to_i.to_s }
        c = !h[:id].blank? ? AnalyticsKey.all_keys_for(self.site_uid).find(h[:id].to_i) : AnalyticsKey.new_for_site(self.site_uid)
        c.attributes = h.reject { |k,v| k == :id } # input values, but don't try to overwrite the id
        self.added_analytics_keys << c unless c.nil? || c.new_and_empty?
      end
    end
    # Delete removed analytics_keys
    analytics_keys.each do |c|
      if h = array_hash.detect { |h| h[:id].to_i.to_s == c.id.to_s }
        c.attributes = h.reject { |k,v| k == :id }
      else
        c.destroy_association = 1
      end
    end
  end
  
  def site_wide_key
    AnalyticsKey.site_wide_key_for(self.site_uid).first rescue nil
  end
  
  def site_wide_analytics_key
    @site_wide_analytics_key ||= self.site_wide_key.key rescue nil
  end
  
  def all_analytics_keys
    AnalyticsKey.all_keys_for(self.site_uid).map { |ak| [ak.nickname, ak.to_form_select_value] }
  end
  
  protected 
    def save_site_wide_analytics_key
      return if self.site_wide_analytics_key.nil?
      
      # Create one if missing
      AnalyticsKey.update_or_create_site_wide_key(self.site_uid, {:key => site_wide_analytics_key})
    end
    
    def save_and_remove_assigned_keys
      self.analytics_keys.each { |c| if c.destroy_association? then self.analytics_keys.delete(c) else c.save end }
      unless self.added_analytics_keys.nil?
        self.added_analytics_keys.each do |c| 
          next if c.nil?
          c.save
          self.analytics_keys << c unless self.analytics_keys.detect { |ak| ak == c }
        end 
      end
    end
end
