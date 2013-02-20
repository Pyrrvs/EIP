class ProjectsController < ApplicationController

  before_filter :load_project, except: [:new, :create ]

  def load_project
    user = User.find_by_name(params[:user_id]) || not_found
    @project = user.projects.find_by_name(params[:id]) || not_found
  end

  # GET /projects
  # GET /projects.json
  # def index
  #   @projects = Project.all

  #   respond_to do |format|
  #     format.html # index.html.erb
  #     format.json { render json: @projects }
  #   end
  # end

  # GET /projects/1
  # GET /projects/1.json
  def show
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @project }
    end
  end

  # GET /projects/new
  # GET /projects/new.json
  def new
    @user = User.find_by_name(params[:user_id]) || not_found
    @project = Project.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @project }
    end
  end

  # GET /projects/1/edit
  def edit
    @user = @project.user
  end

  # POST /projects
  # POST /projects.json
  def create
    @project = Project.new(params[:project])
    @user = User.find_by_name(params[:user_id])
    @project.user_id = @user.id
    @project.nb_stars = 0

    res = @project.save
    if res
      begin
        project_path = "#{Rails.root}/#{AGB_CONFIG['users_dir']}/#{@project.user.name}/#{@project.name}"
        Dir.mkdir(project_path, 0755)
        Dir.mkdir("#{project_path}/Resources", 0755)
        Dir.mkdir("#{project_path}/kFiles", 0755)
        ResourcesController.create_world_file("#{project_path}/kFiles/world.js")
      rescue
        @project.destroy
        @project.errors[:internal] = "- Internal server error: Please contact an administrator."
        puts "Cannot create the project tree for the project " + @project.name + " [owner: " + @project.user.name + "]"
      end
    end

    respond_to do |format|
      if res && !@project.errors.any?
        format.html { redirect_to [@project.user, @project] }
        format.json { render json: @project, status: :created, location: @project }
      else
        format.html { render action: "new" }
        format.json { render json: @project.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /projects/1
  # PUT /projects/1.json
  def update
    respond_to do |format|
      if @project.update_attributes(params[:project])
        format.html { redirect_to [@project.user, @project], notice: 'Project was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @project.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /projects/1
  # DELETE /projects/1.json
  def destroy
    @project.destroy

    project_path = "#{Rails.root}/#{AGB_CONFIG['users_dir']}/#{@project.user.name}/#{@project.name}"
    
    begin
      FileUtils.remove_entry_secure(project_path);
    rescue
      puts "Cannot remove the project directory #{project_path}"
      # Do something... send mail to administrator?
    end

    respond_to do |format|
      format.html { redirect_to user_url @project.user, notice: 'Project was successfully destroyed.' }
      format.json { head :no_content }
    end
  end
end