class ProjectCommentsController < ApplicationController
  # GET /project_comments
  # GET /project_comments.json
  def index
    @project_comments = ProjectComment.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @project_comments }
    end
  end

  # GET /project_comments/1
  # GET /project_comments/1.json
  def show
    @project_comment = ProjectComment.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @project_comment }
    end
  end

  # GET /project_comments/new
  # GET /project_comments/new.json
  def new
    @project_comment = ProjectComment.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @project_comment }
    end
  end

  # GET /project_comments/1/edit
  def edit
    @project_comment = ProjectComment.find(params[:id])
  end

  # POST /project_comments
  # POST /project_comments.json
  def create
    @project_comment = ProjectComment.new(params[:project_comment])

    respond_to do |format|
      if @project_comment.save
        format.html { redirect_to @project_comment, notice: 'Project comment was successfully created.' }
        format.json { render json: @project_comment, status: :created, location: @project_comment }
      else
        format.html { render action: "new" }
        format.json { render json: @project_comment.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /project_comments/1
  # PUT /project_comments/1.json
  def update
    @project_comment = ProjectComment.find(params[:id])

    respond_to do |format|
      if @project_comment.update_attributes(params[:project_comment])
        format.html { redirect_to @project_comment, notice: 'Project comment was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @project_comment.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /project_comments/1
  # DELETE /project_comments/1.json
  def destroy
    @project_comment = ProjectComment.find(params[:id])
    @project_comment.destroy

    respond_to do |format|
      format.html { redirect_to project_comments_url }
      format.json { head :no_content }
    end
  end
end
