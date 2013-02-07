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
end
