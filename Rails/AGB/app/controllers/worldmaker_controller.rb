class WorldmakerController < ApplicationController
  before_filter :load_project, only: [ :world, :update ]

  def load_project
    user = User.find_by_name(params[:user_id]) || not_found
    @project = user.projects.find_by_name(params[:project_id]) || not_found
    @project_path = "#{Rails.root}/#{AGB_CONFIG['users_dir']}/#{@project.user.name}/#{@project.name}/kFiles/world.js"
  end

  def index
  end

  def world
  	respond_to do |format|
  		format.json { send_file @project_path }
  	end
  end

  def update
    ResourcesController.update_world_file @project_path, params[:data].to_json
    render json: { resp: 'success' }
  rescue
    render json: { resp: 'failure' }, status: 500   
  end
end
