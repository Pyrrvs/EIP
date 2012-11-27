var kNode = require('../../util/kNode.js');
var fs = require('fs');

var Controller = kNode.Controller.extend({

	ctor : function(app) {
		this.super(app, new (require('../models/project_mysql.js'))());
		this.user_c = new (require('./user.js'))(app);
		this.precheck_creation_perm = _.bind(this.precheck_creation_perm, this);
		this.precheck_view_projects = _.bind(this.precheck_view_projects, this);

		app.param('project', /^\w+$/);
		this.addRoute('/users/:username/projects/new', 'GET', this.new_project_form, this.precheck_creation_perm);
		this.addRoute('/users/:username/projects', 'GET', this.get_projects, this.precheck_view_projects);
		this.addRoute('/users/:username/projects', 'POST', this.create_project, this.precheck_creation_perm);
		this.addRoute('/users/:username/:project', 'GET', this.get_project, this.precheck_view_projects);
	},

	is_viewable : function(project_name, owner, viewer) {

	},

	precheck_view_projects : function(req, res, next) {
		if (!this.user_c.is_authenticated(req)) {
			res.send('<h1>Authentication needed!</h1>');
			return ;
		}
		this.user_c.user_exists(req.params.username, function(err) {
			if (err) {
				res.send('<h1>User ' + req.params.username + ' doesn\'t exist!</h1>');
				return ;
			}
			next();
		});
	},

	precheck_creation_perm : function(req, res, next) {
		if (!this.user_c.is_authenticated(req)) {
			res.send('<h1>Authentication needed!</h1>');
			return ;
		}
		this.user_c.user_exists(req.params.username, function(err) {
			if (err) {
				res.send('<h1>User ' + req.params.username + ' doesn\'t exist!</h1>');
				return ;
			} else if (req.user.username != req.params.username) {
				res.send('<h1>Access denied!</h1>');
				return;
			}
			next();
		});
	},

	get_project : function(req, res) {
		this.model.find_by_name(req.params.project, function(err, result) {
			if (err) {
				res.send('<h1>Get project problem:</h1><p>'+err+'</p>');
				return ;
			}
			res.render('project.ejs', {username: req.params.username, project: result})			
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