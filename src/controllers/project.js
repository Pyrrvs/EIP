var kNode = require('../../util/kNode.js');
var fs = require('fs');

var Controller = kNode.Controller.extend({

	ctor : function(app) {
		this.super(app, new (require('../models/project_mysql.js'))());
		this.user_model = new (require('../models/user_mysql.js'))();
		this.precheck_creation_perm = _.bind(this.precheck_creation_perm, this);
		this.precheck_view_projects = _.bind(this.precheck_view_projects, this);

		app.param('project', /^\w+$/);
		this.addRoute('/users/:username/projects/new', 'GET', this.precheck_creation_perm, this.new_project_form);
		this.addRoute('/users/:username/projects', 'GET', this.precheck_view_projects, this.get_projects);
		this.addRoute('/users/:username/projects', 'POST', this.precheck_creation_perm, this.create_project);
	},

	precheck_view_projects : function(req, res, next) {
		console.log('precheck_view_projects');
		if (!req.user) {
			res.send('<h1>Authentication needed!</h1>');
			return ;
		}
		this.user_model.find_by_name(req.params.username, function(err, result) {
			console.log(err, result);
			if (!err && !result) {
				res.send('<h1>User ' + req.params.username + ' doesn\'t exist!</h1>');
			}
			next();
		});
	},

	precheck_creation_perm : function(req, res, next) {
		if (!req.user) {
			res.send('<h1>Authentication needed!</h1>');
			return ;
		}
		this.user_model.find_by_name(req.params.username, function(err, result) {
			if (!err && !result) {
				res.send('<h1>User ' + req.params.username + ' doesn\'t exist!</h1>');
			}
			if (req.user.username != req.params.username) {
				res.send('<h1>Access denied!</h1>');
				return ;
			}
			next();
		});
	},

	get_projects : function(req, res) {
		if (req.user.username == req.params.username) {
			this.model.find_by_owner(req.params.username, function(err, results) {

				console.log('get projects ', err, results);
				res.render('projects.ejs', { username: req.params.username, projects: results });
			});
		} else {
			this.model.find_by_owner(req.params.username, function(err, results) {

				console.log('get projects ', err, results);
				res.render('projects.ejs', { username: req.params.username, projects: results });
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
				console.log('Handle project creation error here ', err);
				res.send('<h1>Error during project creation process</h1><p>' + err + '</p>');
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