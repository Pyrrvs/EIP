var kNode = require('../../util/kNode.js');
var fs = require('fs');

var Controller = kNode.Controller.extend({

	ctor : function(app) {
		this.super(app, new (require('../models/project_mysql.js'))());
		app.param('project', /^\w+$/);
		this.addRoute('/users/:username/:project', 'GET', this.check_permissions, this.get_project);
		this.addRoute('/users/:username/projects/new', 'GET', this.check_permissions, this.new_project_form)
		this.addRoute('/users/:username/projects', 'POST', this.check_permissions, this.create_project)
	},

	check_permissions : function(req, res, next) {
		console.log('check_permissions')
		if (!req.user) {
			res.redirect('/');
			console.log('Authentication required.');
			return ('Authentication required.');
		}
		next();
	},

	get_project : function(req, res) {
		res.redirect('/');
	},

	create_project : function(req, res) {
		var new_proj = {};
		new_proj.user_id = req.user.id;
		new_proj.name = req.body.name;
		this.model.create(new_proj, function(err, result) {
			if (err){
				console.log('Handle project creation error here ', err);
			} else {
				new_proj.id = result.id;
				console.log('New project created with the id ' + new_proj.id);
				fs.mkdir('./users/' + req.user.username + '/' + new_proj.name, 0755, function() {
              		console.log('Directory ./users/' + req.user.username + '/' + new_proj.name + ' created');
              		fs.mkdir('./users/' + req.user.username + '/' + new_proj.name + '/' + 'Resources', function() {
              			console.log('Directory ./users/' + req.user.username + '/' + new_proj.name  + '/' + 'Resources' + ' created');
              		});
              		    fs.mkdir('./users/' + req.user.username + '/' + new_proj.name + '/' + 'kFiles', function() {
              			console.log('Directory ./users/' + req.user.username + '/' + new_proj.name  + '/' + 'kFiles' + ' created');
              		});
            	});
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