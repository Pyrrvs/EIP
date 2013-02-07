class Resource < ActiveRecord::Base
  attr_accessible :name, :project_id, :file_type, :project
  validates :name, presence: true, length: { in:1..20 }
  validates :file_type, presence: true, inclusion: ["image", "script", "animation", "world"]

  # checks the uniqueness by user
  validates_each :name do |record, attr, value|
  	# shouldnt be there 
  	unless record.project.nil?
	  	record.errors.add(attr, "Project already exists") unless record.project.project_comments.reject { |resource| resource.name != value }.empty?
	end
  end

  belongs_to :project
end
