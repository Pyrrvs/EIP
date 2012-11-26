var kNode = require('../../util/kNode.js')

var Controller = kNode.Controller.extend({

	ctor : function(app) {

		this.super(app, new (require('../models/index_mysql.js'))());
		this.addRoute('/', 'GET', this.index_page);
	},

	index_page : function(req, resp) {


		resp.render('index.ejs', { user: req.user });
	}
});

module.exports = function(app) {

	return (new Controller(app));
}