var kNode = require('../../util/kNode.js')

var Controller = kNode.Controller.extend({

	ctor : function(app) {

		this.super(app, new (require('../models/index_mysql.js'))());
		this.addRoute('/', 'GET', this.get_index);
	},

	get_index : function(req, res) {
		res.render('index.ejs', { user : helper.create_user_obj(req.user) });
	}
});

module.exports = function(app) {

	return (new Controller(app));
}