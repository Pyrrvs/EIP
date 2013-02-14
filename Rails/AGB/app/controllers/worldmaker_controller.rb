class WorldmakerController < ApplicationController
  def index
  end

  def world
    user = User.find_by_name(params[:user_id])
    project = user.projects.find(params[:project_id])
  	respond_to do |format|
  		format.json { send_file('./users/' + user.name + '/' + project.name + '/kFiles/world.js') }
  	end
  end

  def update
  end
end