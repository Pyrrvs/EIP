var kNode = require('../../util/kNode.js');
var fs = require('fs');

var Controller = kNode.Controller.extend({

	ctor : function(app) {
		this.super(app, new (require('../models/resource_mysql.js'))(app));
		this.addRoute('/users/:username/:project/addResource', 'POST', this.upload_resource, helper.precheck_edit_perm);
	},

	upload_resource : function(req, res) {
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