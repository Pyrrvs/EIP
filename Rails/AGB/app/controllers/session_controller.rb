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
   	 		json_resp = { status: 'success'}
      	else
   			json_resp = { status: 'failure', errors: { :'global-errors' => ["The username or password you entered is incorrect."] } }.to_json
   		end
		render json: json_resp
	end

	def destroy
	  set_current_user(nil)
	  session[:user_id] = nil

	  respond_to do |format|
	  	format.js
	  end
	end
end
