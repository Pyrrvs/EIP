class UsersController < ApplicationController
 
  before_filter :load_user, except: [ :create ]

  def load_user
    @user = User.find_by_name(params[:id]) || not_found
  end
  # GET /users
  # GET /users.json

  # def index
  #   @users = User.all 

  #   respond_to do |format|
  #     format.html # index.html.erb
  #     format.json { render json: @users }
  #   end
  # end

  # GET /users/1
  # GET /users/1.json
  def show
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @user }
    end
  end

  # GET /users/new
  # GET /users/new.json
  # def new
  #   @new_user = User.new

  #   respond_to do |format|
  #     format.html # new.html.erb
  #     format.json { render json: @user }
  #   end
  # end

  # GET /users/1/edit
  def edit
  end

  # POST /users
  # POST /users.json
  def create
    @user = User.new(params[:user])

    if @user.save
      begin
        Dir.mkdir('./users/' + @user.name, 0755)
      rescue
        @user.destroy
        @user.errors[:internal] = "Internal server error: Please contact an administrator."
        puts "Cannot create the user directory /users/" + @user.name
      end
    end
    respond_to do |format|
      format.js
    end
  end

  # PUT /users/1
  # PUT /users/1.json
  def update
    respond_to do |format|
      if @user.update_attributes(params[:user])
        format.html { redirect_to @user, notice: 'User was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /users/1
  # DELETE /users/1.json
  def destroy
    @user.destroy
    begin
      puts @user.name
      FileUtils.remove_entry_secure('./users/' + @user.name);
    rescue
      puts "Cannot remove the user directory /users/" + @user.name
      # Do something... send mail to administrator?
    end

    respond_to do |format|
      format.html { redirect_to users_url }
      format.json { head :no_content }
    end
  end

  def self.input_size
    20
  end
end
