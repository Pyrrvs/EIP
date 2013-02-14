class User < ActiveRecord::Base
  attr_accessible :email, :name, :password, :password_confirmation, :projects, :project_comments
  validates :name, presence: true, uniqueness: true, length: { in: 3..20 }
  validates :email, presence: true, uniqueness: true, email: true
  validates :password, presence: true, length:  { in: 6..20 }

  has_secure_password

  has_many :projects
  has_many :project_comments

  def to_param
  	name
  end
end
