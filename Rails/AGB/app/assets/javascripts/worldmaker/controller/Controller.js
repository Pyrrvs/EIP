define(["class"], function(Class) {

	var Controller = Class.extend({

		getWorld : function(callback) {

			$.ajax(window.location.pathname + "/world", { type : "GET", dataType : "json", success : function(world) {
				App.defaultId = world.id;
				for (var i in world.levels)
					App.levels.push(world.levels[i]);
				callback();
			}.bind(this), error : function(log) { console.log(log); }});
			return (this);
		},

		putWorld : function() {

			var d = {
				"levels" : App.levels.toJSON(),
				"id" : App.defaultId,
			};

			$.ajax(window.location.pathname + "/world", { type : "PUT", dataType : "json",
				data : { data : JSON.parse(JSON.stringify(d)) }, success : function(res) {
			}, error : function(log) { console.log(log); }});
		},
	});

	App.controller = new Controller;
});
