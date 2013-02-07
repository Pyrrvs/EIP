class Project < ActiveRecord::Base
  attr_accessible :description, :name, :nb_stars, :privacy, :user_id
end
