class WorldmakerController < ApplicationController
  before_filter :load_project, only: [ :world ]

  def load_project
    user = User.find_by_name(params[:user_id]) || not_found
    @project = user.projects.find_by_name(params[:project_id]) || not_found
  end

  def index
  end

  def world
  	respond_to do |format|
  		format.json { send_file('./users/' + @project.user.name + '/' + @project.name + '/kFiles/world.js') }
  	end
  end

  def update

  end
end
