class UsersController < ApplicationController
 
  before_filter :load_user, except: [ :create ]

  def load_user
    @user = User.find_by_name(params[:id]) || not_found
  end

  # GET /username
  def show
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @user }
    end
  end

  # POST /
  def create
    @user = User.new(params[:user])

    @user.save
    respond_to do |format|
      format.js
    end
  end

  # PUT /username
  def update
    respond_to do |format|
      if @user.update_attributes(params[:user])
        format.html { redirect_to @user, notice: 'User was successfully updated.' }
      else
        format.html { render action: "edit" }
      end
    end
  end

  # DELETE /username
  def destroy
    @user.destroy

    respond_to do |format|
      format.html { redirect_to root_path, notice: 'User was successfully deleted'}
    end
  end

  def self.input_size
    20
  end
end
