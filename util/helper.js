module.exports = {
	create_user_obj : function(user){
		return (user ? { username : user.username, email : user.email, home : user.home } : undefined);
	},

	is_authenticated : function(req) {
    	return (req.user)
  	},

  	internal_server_error : function(res, err) {
  		res.status(500).send('<h1>Internal error</h1><p>'+err+'</p>');
  	},

  	no_such_user : function(res, username) {
  		res.status(404).send('<h1>User ' + username + ' doesn\'t exist!</h1>');
  	},

  	no_such_project : function(res, project, owner) {
  		res.status(404).send('<h1>No project ' + project + ' for ' + owner + '</h1>');
  	}
}
