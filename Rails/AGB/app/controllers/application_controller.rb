class ApplicationController < ActionController::Base
  protect_from_forgery

  def index
  	@user = current_user
  	@proj = Project.create user_id: @user.id, name: "proj", privacy: "public", nb_stars: 1
  	respond_to do |format|
  		format.html
  	end
  end

  protected

  def current_user
	User.find(session[:user_id])
  rescue
	user = User.create name: "Kraoz", password: "toto42", email: "toto@titit.com"
	session[:user_id] = user.id
  	user
  end
end
