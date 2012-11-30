var kNode = require('../../util/kNode.js');
var fs = require('fs');

var Controller = kNode.Controller.extend({

	ctor : function(app) {
		this.super(app, null);
		this.addRoute('/users/:username/:project/addResource', 'POST', this.upload_resource);
	},

	upload_resource : function(req, res) {
		console.log('Resource uploaded: ', req.files);
		user_ctrl.get_user(req.params.username, function(err, user) {
			if (err) {
				helper.internal_server_error(res, err);
				return ;
			}
			fs.rename(req.files.resource_file.path,
			'./' + user.home + '/' + req.params.project + '/Resources/' + req.body.resource_name,
			function(err) {
				if (err) {
					helper.internal_server_error(res, err);
					return ;
				} else {
					console.log('insert to database');
				}
			});
		});
	}
});

module.exports = function(app) {

	return (new Controller(app));
}