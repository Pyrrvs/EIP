class User < ActiveRecord::Base
  attr_accessible :email, :name, :password, :projects, :project_comments
  validates :name, presence: true, uniqueness: true, length: { in: 3..20 }
  validates :email, presence: true, uniqueness: true, email: true
  validates :password, presence: true, length:  { in: 6..20 }
  
  has_many :projects
  has_many :project_comments
end
