var Controller = Class.extend({

	model : null,

	ctor : function(app, model) {

		this.model = _.isString(model) ? (new (require(model))) : model;
		this.app = app;
	},

	addRoute : function(route, method, hook, restrict) {

		var self = this;
		if (arguments.length == 3) {
			console.log('addRoute 3 args');
			this.app[method.toLowerCase()](route, function(req, resp) {
				resp.socket.setMaxListeners(0);
				hook.call(self, req, resp);
			});
		} else {
			console.log('addRoute 4 args')
			this.app[method.toLowerCase()](route, restrict, function(req, resp) {
				resp.socket.setMaxListeners(0);
				hook.call(self, req, resp);
			});
		}
	},

});

module.exports = Controller;