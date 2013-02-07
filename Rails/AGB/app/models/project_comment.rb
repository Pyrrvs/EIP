class ProjectComment < ActiveRecord::Base
  attr_accessible :content, :project, :project_id, :title, :user, :user_id
  validates :content, length: { in: 1..200 }
  validates :title, length: { in: 1..200 }

  belongs_to :project
  belongs_to :user
end
