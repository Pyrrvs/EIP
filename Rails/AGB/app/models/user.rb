class User < ActiveRecord::Base
  attr_accessible :email, :name, :password, :password_confirmation, :projects, :project_comments
  validates :name, presence: true, uniqueness: true, length: { in: 3..20 }
  validates :email, presence: true, uniqueness: true, email: true
  validates :password, presence: true, length:  { in: 6..20 }

  has_secure_password

  has_many :projects
  has_many :project_comments

  after_create :create_user_dir

  def create_user_dir
    begin
      Dir.mkdir("#{Rails.root}/#{AGB_CONFIG['users_dir']}/#{self.name}", 0755)
    rescue
      self.destroy
      self.errors[:internal] = "Internal server error: Please contact an administrator."
      puts "Cannot create the user directory #{Rails.root}/#{AGB_CONFIG['users_dir']}/#{self.name}"
    end
  end

  after_destroy :destroy_user_dir
  
  def destroy_user_dir
    begin
      FileUtils.remove_entry_secure("#{AGB_CONFIG['users_dir']}/#{self.name}");
    rescue
      puts "Cannot remove the user directory #{AGB_CONFIG['users_dir']}/#{self.name}"
      # Do something... send mail to administrator?
    end
  end

  def to_param
  	name
  end
end
