class AnalyticsKey < ActiveRecord::Base
  SITE_WIDE_KEY = "Site-Wide Key"
  has_and_belongs_to_many :page_object
  
  attr_protected :site_uid
  validates_uniqueness_of :nickname, :scope => :site_uid
  validates_presence_of :site_uid
  
  named_scope :site_wide_key_for, lambda { |st_uid| {
    :conditions => { :site_uid => st_uid, :nickname => SITE_WIDE_KEY }
  } }
  
  named_scope :all_keys_for, lambda { |st_uid| {
    :conditions => ['site_uid = ? AND nickname != ?', st_uid, SITE_WIDE_KEY]
  } }
  
  def self.new_for_site(st_uid, attrs = {})
    returning new(attrs) do |ak|
      ak.site_uid = st_uid
    end
  end
  
  def self.update_or_create_site_wide_key(st_uid, attrs)
    site_key = AnalyticsKey.site_wide_key_for(st_uid).first
    unless site_key
      site_key = new_for_site(st_uid, attrs)
      site_key.nickname = SITE_WIDE_KEY
    else
      site_key.key = attrs[:key]
    end  
    site_key.save!
    site_key
  end
  
  def to_form_select_value
    "#{self.id}-#{self.key}"
  end
  
  def new_and_empty?
    new_record? && nickname.blank? && key.blank?
  end
  
  ###### Association Specific Code

  # Used for other models that might need to mark a item as *no longer* associated 
  attr_accessor :destroy_association

  # Used for other models (like an page_object) that might need to mark this item as *no longer* associated
  def destroy_association?
    destroy_association.to_i == 1
  end
end
