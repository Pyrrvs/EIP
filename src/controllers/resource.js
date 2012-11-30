var kNode = require('../../util/kNode.js');
var fs = require('fs');

var Controller = kNode.Controller.extend({

	ctor : function(app) {
		this.super(app, new (require('../models/resource_mysql.js'))(app));
		this.addRoute('/users/:username/:project/addResource', 'POST', this.post_resource, helper.project_edit_perm);
		this.addRoute('/users/:username/:project/resources', 'GET', this.get_resources, helper.project_edit_perm);
	},

	get_resources : function(req, res) {
		var resources = {
			[{ id: 1, project_id: 1, name: 'ball.png', path: '/users/Pyrrvs/pyrrvs1/Resources/ball.png', type: 'image'},
			{ id: 2, project_id: 1, name: 'box.png', path: '/users/Pyrrvs/pyrrvs1/Resources/box.png', type: 'image'},
			{ id: 2, project_id: 1, name: 'enemy.js', path: '/users/Pyrrvs/pyrrvs1/Resources/enemy.js', type: 'script'},
			{ id: 2, project_id: 1, name: 'ally.png', path: '/users/Pyrrvs/pyrrvs1/Resources/ally.png', type: 'script'}]
		};
		res.json({ resources : resources });
	}

	post_resource : function(req, res) {
		console.log('Resource uploaded: ', req.files);
		user_ctrl.get_user(req.params.username, function(err, user) {
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
					// this.model.create({ project_id: project.id, path: path, type: 'image' }, function(err, callback) {

					// });
				});
			});
		});
	},

	create_resource : function(resource, callback) {
		this.model.create(resource, callback);
	}
});

module.exports = function(app) {

	return (new Controller(app));
}