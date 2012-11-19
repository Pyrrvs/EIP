var Controller = Class.extend({

	view : null,
	model : null,

	ctor : function(app, view, model) {

		this.view = _.isString(view) ? (new (require(view))) : view;
		this.model = _.isString(model) ? (new (require(model))) : model;
		this.app = app;
	},

	addRoute : function(route, method, hook) {

		var self = this;
		this.app[method.toLowerCase()](route, function(req, resp) {
			resp.socket.setMaxListeners(0);
			hook.call(self, req, resp);
		});
	},
});

module.exports = Controller;