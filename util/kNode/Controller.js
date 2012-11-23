var Controller = Class.extend({

	model : null,

	ctor : function(app, model) {

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