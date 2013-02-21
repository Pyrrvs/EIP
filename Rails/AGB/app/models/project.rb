class Project < ActiveRecord::Base
  attr_accessible :description, :name, :nb_stars, :privacy, :user, :user_id, :project_comments
  validates :name, presence: true, length: { in: 3..20 }
  validates :description, length: { maximum: 1000 }
  validates :privacy, presence: true, inclusion: ["public", "private"]
  validates :nb_stars, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }

  # checks the uniqueness by user
  validates_each :name do |record, attr, value|
  	# shouldnt be there 
  	unless record.user.nil?
	  	record.errors.add(attr, "Project already exists") unless record.user.projects.reject { |proj| proj.name != value }.empty?
	end
  end

  belongs_to :user
  has_many :project_comments

  after_create :create_project_tree

  def create_project_tree
    begin
      project_path = "#{Rails.root}/#{AGB_CONFIG['users_dir']}/#{self.user.name}/#{self.name}"
      Dir.mkdir(project_path, 0755)
      Dir.mkdir("#{project_path}/Resources", 0755)
      Dir.mkdir("#{project_path}/kFiles", 0755)
      ResourcesController.create_world_file("#{project_path}/kFiles/world.js")
    rescue
      self.destroy
      self.errors[:internal] = "- Internal server error: Please contact an administrator."
      puts "Cannot create the project tree for the project #{self.name} [owner: #{self.user.name}]"
    end
  end

  after_destroy :destroy_project_tree

  def destroy_project_tree
    project_path = "#{Rails.root}/#{AGB_CONFIG['users_dir']}/#{self.user.name}/#{self.name}"
    
    begin
      FileUtils.remove_entry_secure(project_path);
    rescue
      puts "Cannot remove the project directory #{project_path}"
      # Do something... send mail to administrator?
    end
  end

  def to_param
    name
  end
end
