kNode = require('../../util/kNode.js')

var Controller = kNode.Controller.extend({

	ctor : function(app) {

		this.super(app, new (require('../models/user_mysql.js'))());
		this.addRoute('/sign_in', 'POST', this.signIn);
		this.addRoute('/', 'GET', this.signIn);
	},

	signIn : function(req, resp) {
		console.log('hey dude!');
		console.log(this.model.getUsers);
		this.model.getUsers(function(error, rows, cols) {
			console.log(error);
			console.log(rows);
			console.log(cols);
		});
	},
});

module.exports = function(app) {

	return (new Controller(app));
}