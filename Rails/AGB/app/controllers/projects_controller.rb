class ProjectsController < ApplicationController

  before_filter :load_project, except: [:new, :create ]

  def load_project
    user = User.find_by_name(params[:user_id]) || not_found
    @project = user.projects.find_by_name(params[:id]) || not_found
  end

  # GET /username/projectname
  def show
    respond_to do |format|
      format.html # show.html.erb
    end
  end

  # GET /username/new
  def new
    @user = User.find_by_name(params[:user_id]) || not_found
    @project = Project.new

    respond_to do |format|
      format.html # new.html.erb
    end
  end

  # GET /username/projectname/edit
  def edit
    @user = @project.user
  end

  # POST /projects
  def create
    @project = Project.new(params[:project])
    @user = User.find_by_name(params[:user_id])
    @project.user_id = @user.id
    @project.nb_stars = 0

    if (@project.save && !@project.errors.any?)
      render json: {}.to_json, status: 200
    else
      render json: { errors: @project.errors }.to_json, status: 500
    end
  end

  # PUT /username/projectname/
  def update
    respond_to do |format|
      if @project.update_attributes(params[:project])
        format.html { redirect_to [@project.user, @project], notice: 'Project was successfully updated.' }
      else
        format.html { render action: "edit" }
      end
    end
  end

  # DELETE /username/projectname/
  def destroy
    @project.destroy

    respond_to do |format|
      format.html { redirect_to(user_url(@project.user), notice: 'Project was successfully destroyed.') }
    end
  end
end