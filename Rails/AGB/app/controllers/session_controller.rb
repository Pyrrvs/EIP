class SessionController < ApplicationController
	def new
	end

	def create
	  user = User.find_by_name(params[:name])

   	  if (user && user.authenticate(params[:password]))
   	 	set_current_user(user)
   	 	session[:user_id] = user.id
      end
	  respond_to do |format|
	    format.js
      end
	end

	def destroy
	  set_current_user(nil)
	  session[:user_id] = nil

	  respond_to do |format|
	  	format.js
	  end
	end
end
