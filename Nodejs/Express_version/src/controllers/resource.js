var kNode = require('../../util/kNode.js');
var fs = require('fs');

var Controller = kNode.Controller.extend({

	ctor : function(app) {
		this.super(app, new (require('../models/resource_mysql.js'))());
		this.addRoute('/users/:username/:project/addResource', 'POST', this.post_resource, helper.project_edit_perm);
		this.addRoute('/users/:username/:project/resources', 'GET', this.get_resources, helper.project_edit_perm);
	},

	get_resources : function(req, res) {
		var resources = { 
			resources : [
				{ id: 1, project_id: 1, name: 'ball.png', path: '/users/Pyrrvs/pyrrvs1/Resources/ball.png', type: 'image'},
				{ id: 2, project_id: 1, name: 'box.png', path: '/users/Pyrrvs/pyrrvs1/Resources/box.png', type: 'image'},
				{ id: 3, project_id: 1, name: 'enemy.js', path: '/users/Pyrrvs/pyrrvs1/Resources/enemy.js', type: 'script'},
				{ id: 4, project_id: 1, name: 'ally.png', path: '/users/Pyrrvs/pyrrvs1/Resources/ally.png', type: 'script'} 
			]
		};
		res.json(resources);
	},

	create_world_file : function(resource, callback) {
		this.model.create(resource, function(err, result) {
			fs.writeFile('./' + resource.path, '{ "levels" : [], "classes" : [], "sprites" : [], "id" : 0 }', function (err) {
  				if (err) {
  					callback(err);
  					return ;
  				}
			});

		});
	},

	find_world_file : function(project, callback) {
		this.model.find_world_file(project, callback);
	},

	post_resource : function(req, res) {
		console.log('Resource uploaded: ', req.files);
		var type = req.files.resource_file.type;
		var model = this.model;
		if (type == 'image/jpeg' || type == 'image/png' || type == 'image/gif') {
			type = 'image';
		} else if (type == 'text/javascript') {
			type = 'script';
		} else {
			helper.wrong_resource_type(res, type);
			return ;
		}
		user_ctrl.find_by_name(req.params.username, function(err, user) {
			if (err) {
				helper.internal_server_error(res, err);
				return ;
			}
			var path = './' + user.home + '/' + req.params.project + '/Resources/' + req.body.resource_name;
			fs.rename(req.files.resource_file.path, path, function(err) {
				if (err) {
					helper.internal_server_error(res, err);
					return ;
				}
				project_ctrl.find_by_name_and_owner(req.params.project, req.params.username, function(err, project) {
					if (err) {
						helper.internal_server_error(res, err);
						return ;
					}
					model.create({
					project_id: project.id,
					name: req.body.resource_name,
					path: path, type: type
					}, function(err, result) {
						if (err) {
							helper.internal_server_error(res, err);
							return ;							
						}
						res.redirect('/users/' + req.params.username);
					});
				});
			});
		});
	}
});

module.exports = function(app) {

	return (new Controller(app));
}