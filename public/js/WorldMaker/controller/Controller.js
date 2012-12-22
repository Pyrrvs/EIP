define(["class"], function(Class) {

	var Controller = Class.extend({

		getWorld : function(callback) {

			$.ajax(window.location.pathname + "/getWorld", { type : "GET", dataType : "json", success : function(world) {
				window.defaultId = world.id;
				for (var i in world.levels)
					window.levels.push(world.levels[i]);
				callback();
			}.bind(this), error : function(log) { console.log(log); }});
			return (this);
		},

		postWorld : function(req) {

			var d = {
				"levels" : window.levels.toJSON(),
				"id" : window.defaultId,
			};

			$.ajax(window.location.pathname + "/postWorld", { type : "POST", dataType : "json",
				data : JSON.parse(JSON.stringify(d)), success : function(res) {
				console.log(res);
			}, error : function(log) { console.log(log); }});
		},
	});

	window.controller = new Controller;
});