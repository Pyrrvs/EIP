module.exports = {
	create_user_obj : function(user){
		return (user ? { username : user.username, email : user.email, home : user.home } : undefined);
	},

	is_authenticated : function(req) {
    	return (req.user)
  	}
}