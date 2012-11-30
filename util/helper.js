module.exports = {
	create_user_obj : function(user){
		return (user ? { username : user.username, email : user.email, home : user.home } : undefined);
	},

	check_authentication : function(req, res) {
      if (!req.user) {
        res.status(401).send('<h1>Authentication needed!</h1>');
        return (false);
      }
    	return (true);
  	},

  	internal_server_error : function(res, err) {
  		res.status(500).send('<h1>Internal error</h1><p>'+err+'</p>');
  	},

  	no_such_user : function(res, username) {
  		res.status(404).send('<h1>User ' + username + ' doesn\'t exist!</h1>');
  	},

  	no_such_project : function(res, project, owner) {
  		res.status(404).send('<h1>No project ' + project + ' for ' + owner + '</h1>');
  	},

    access_denied : function(res) {
      res.status(403).send('<h1>Access denied!</h1>');
    },

    project_edit_perm : function(req, res, next) {
    if (!helper.check_authentication(req, res)) {
      return ;
    }
    user_ctrl.find_by_name(req.params.username, function(err, result) {
      if (err) {
        helper.internal_server_error(res, err);
        return ;
      } else if (!result) {
        helper.no_such_user(res, req.params.username);
        return ;
      } else if (req.user.username != req.params.username) {
        helper.access_denied(res);
        return;
      }
      next();
    });
  },

  project_view_perm : function(req, res, next) {
    if (!helper.check_authentication(req, res)) {
      return ;
    }
    user_ctrl.find_by_name(req.params.username, function(err, result) {
      if (err) {
        helper.internal_server_error(res, err);
        return ;
      } else if (!result) {
        helper.no_such_user(res, req.params.username);
        return ;
      }
      next();
    });
  }
}
