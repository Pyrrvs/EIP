class ApplicationController < ActionController::Base
  protect_from_forgery

  helper_method :current_user, :set_current_user
  before_filter :current_user

  def index
  	respond_to do |format|
  		format.html
  	end
  end

private
  def set_current_user(user)
    @current_user = user
  end

  def current_user
    @current_user ||= session[:user_id] && User.find(session[:user_id])
  rescue
    @current_user = nil
    session[:user_id] = nil
  end
end
