class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :load_user

  def index
  	respond_to do |format|
  		format.html
  	end
  end

  private

  def load_user
    @new_user = User.new
  end

  protected

 #  def current_user
	# User.find(session[:user_id])
 #  rescue
	# user = User.create name: "Kraoz", password: "toto42", email: "toto@titit.com"
	# session[:user_id] = user.id
 #  	user
 #  end
end
