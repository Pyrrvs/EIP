var kNode = require('../../util/kNode.js');
var fs = require('fs');

var Controller = kNode.Controller.extend({

	ctor : function(app) {
		this.super(app, new (require('../models/project_mysql.js'))());
		this.precheck_creation_perm = _.bind(this.precheck_creation_perm, this);
		this.precheck_view_projects = _.bind(this.precheck_view_projects, this);

		app.param('project', /^\w+$/);
		this.addRoute('/users/:username/projects/new', 'GET', this.new_project_form, this.precheck_creation_perm);
		this.addRoute('/users/:username/projects', 'GET', this.get_projects, this.precheck_view_projects);
		this.addRoute('/users/:username/projects', 'POST', this.create_project, this.precheck_creation_perm);
		this.addRoute('/users/:username/:project', 'GET', this.get_project, this.precheck_view_projects);
	},

	is_viewable_by : function(project_name, owner, viewer, callback) {
		this.model.find_by_name_and_owner(project_name, owner, function(err, result) {
			console.log('is_viewable_by ' + result);
		});
	},

	is_editable_by : function(project_name, owner, viewer, callback) {
		this.model.find_by_name_and_owner(project_name, owner, function(err, result) {
			if (result) {
				if (owner == viewer) {
					callback(err, true);
				} else {
					callback(err, false);
				}
			} else {
				callback(err, false);
			}
		});
	},

	precheck_view_projects : function(req, res, next) {
		if (!helper.is_authenticated(req)) {
			res.send('<h1>Authentication needed!</h1>');
			return ;
		}
		user_ctrl.user_exists(req.params.username, function(err) {
			if (err) {
				helper.no_such_user(res, req.params.username);
				return ;
			}
			next();
		});
	},

	precheck_creation_perm : function(req, res, next) {
		if (!helper.is_authenticated(req)) {
			res.send('<h1>Authentication needed!</h1>');
			return ;
		}
		user_ctrl.user_exists(req.params.username, function(err) {
			if (err) {
				helper.no_such_user(res, req.params.username);
				return ;
			} else if (req.user.username != req.params.username) {
				res.send('<h1>Access denied!</h1>');
				return;
			}
			next();
		});
	},

	get_project : function(req, res) {
		this.model.find_by_name_and_owner(req.params.project, req.params.username, function(err, result) {
			if (err) {
				helper.internal_server_error(res, err);
				return ;
			} else if (!result) {
				helper.no_such_project(res, req.params.project, req.params.username)
				return ;				
			}
			res.render('project.ejs', {username: req.params.username, project: result})			
		});
	},

	get_projects : function(req, res) {
		if (req.user.username == req.params.username) {
			this.model.find_by_owner(req.params.username, function(err, results) {
				res.render('projects.ejs', { username: req.params.username, projects: results });
			});
		} else {
			this.model.find_by_owner(req.params.username, function(err, results) {
				res.render('projects.ejs', { username: req.params.username, projects: results });
			}, 'public');	
		}
	},

	get_project_list : function(owner, viewer, callback) {
		if (viewer == owner) {
			this.model.find_by_owner(owner, function(err, results) {
				callback(err, results);
			});
		} else {
			this.model.find_by_owner(owner, function(err, results) {
				callback(err, results);
			}, 'public');	
		}
	},

	create_project : function(req, res) {
		if (req.user.username != req.params.username) {
			res.send('<h1>Access denied!</h1>');
			return ;
		}
		var new_proj = {};
		new_proj.owner_id = req.user.id;
		new_proj.name = req.body.name;
		new_proj.privacy = req.body.privacy;
		this.model.create(new_proj, function(err, result) {
			if (err){
				helper.internal_server_error(res, err);
				return ;
			} else {
				new_proj.id = result.id;
				fs.mkdir('./users/' + req.user.username + '/' + new_proj.name, 0755, function(err) {
					if (err) {
						console.log('Project ' + new_proj.name + ' directory creation error: ', err);
					} else {
	              		fs.mkdir('./users/' + req.user.username + '/' + new_proj.name + '/' + 'Resources', function(err) {
	              			if (err) {
	              				console.log('Project ' + new_proj.name + ' subdirectory Resources creation error: ', err);
	              			}
	              		});
	              		fs.mkdir('./users/' + req.user.username + '/' + new_proj.name + '/' + 'kFiles', function(err) {
	              			if (err) {
	              				console.log('Project ' + new_proj.name + ' subdirectory Resources creation error: ', err);
	              			}
	              		});
	              	}
            	});
            	res.redirect('/users/' + req.user.username + '/projects');
			}
		});
	},

	new_project_form : function(req, res) {
		res.render('new_project_form.ejs', { username: req.params.username });
	}

});

module.exports = function(app) {

	return (new Controller(app));
}