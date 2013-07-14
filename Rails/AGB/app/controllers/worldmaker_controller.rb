class WorldmakerController < ApplicationController
  
# ADD UNIT TESTING
# ADD UNIT TESTING
# ADD UNIT TESTING
# ADD UNIT TESTING
# ADD UNIT TESTING
# ADD UNIT TESTING
# ADD UNIT TESTING
# ADD UNIT TESTING
# ADD UNIT TESTING
# ADD UNIT TESTING
# ADD UNIT TESTING
# ADD UNIT TESTING
# ADD UNIT TESTING
# ADD UNIT TESTING
# ADD UNIT TESTING
# ADD UNIT TESTING
# ADD UNIT TESTING
# ADD UNIT TESTING
# ADD UNIT TESTING

  before_filter :load_project

  def load_project
    user = User.find_by_name(params[:user_id]) || not_found
    @project = user.projects.find_by_name(params[:project_id]) || not_found
    @project_path = "#{Rails.root}/#{AGB_CONFIG['users_dir']}/#{@project.user.name}/#{@project.name}/kFiles/world.json"
  end

  def index
  end

  def world
    render json: File.read(@project_path)
  end

  def update
    ResourcesController.update_world_file @project_path, params[:world].to_json
    render json: { error: nil }
  rescue
    render json: { error: 'fail' }
  end
end
