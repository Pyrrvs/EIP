class SessionController < ApplicationController
	def new
	end

	def show
		render layout: 'session'
	end

	def create
		user = User.find_by_name(params[:name])

	   	if (user && user.authenticate(params[:password]))
   	 		set_current_user(user)
   	 		session[:user_id] = user.id
   	 		render json: {}.to_json, status: 200
      	else
   			render json: { status: 'failure', errors: [ "The username or password you entered is incorrect." ] }.to_json, status: 500
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
