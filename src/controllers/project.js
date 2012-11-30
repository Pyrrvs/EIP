var kNode = require('../../util/kNode.js');
var fs = require('fs');

var Controller = kNode.Controller.extend({

	ctor : function(app) {
		this.super(app, new (require('../models/project_mysql.js'))());

		app.param('project', /^\w+$/);
		this.addRoute('/users/:username/projects/new', 'GET', this.new_project_form, helper.project_edit_perm);
		this.addRoute('/users/:username/projects', 'POST', this.create_project, helper.project_edit_perm);
		this.addRoute('/users/:username/:project', 'GET', this.get_project, helper.project_view_perm);
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

	find_by_name_and_owner : function(project, owner, callback) {
		this.model.find_by_name_and_owner(project, owner, callback);
	},

	find_by_owner : function(owner, viewer, callback) {
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

	get_project : function(req, res) {
		console.log('yo bro');
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

	create_project : function(req, res) {
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
						helper.internal_server_error(res, err);
						return ;
					} else {
	              		fs.mkdir('./users/' + req.user.username + '/' + new_proj.name + '/' + 'Resources', function(err) {
	              			if (err) {
	              				helper.internal_server_error(res, err);
								return ;
	              			}
	              		});
	              		fs.mkdir('./users/' + req.user.username + '/' + new_proj.name + '/' + 'kFiles', function(err) {
	              			if (err) {
	              				helper.internal_server_error(res, err);
								return ;
							}
	              			resource_ctrl.create_world_file({
	              			project_id: new_project.id, name: 'world.js',
	              			path: '/users/' + req.user.username + '/' + new_proj.name + '/' + 'kFiles/world.js',
	              			type: 'kworldmaker'
	              			}, function(err, result) {
	              				if (err) {
									helper.internal_server_error(res, err);
									return ;
								}
	              			});
	              		});
	              	}
            	});
            	res.redirect('/users/' + req.user.username + '/projects');
			}
		});
	},
});

module.exports = function(app) {
	return (new Controller(app));
}