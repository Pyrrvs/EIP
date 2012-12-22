define(["class"], function(Class) {

	var Controller = Class.extend({

		getWorld : function(callback) {

			$.ajax(window.location.pathname + "/getWorld", { type : "GET", dataType : "json", success : function(world) {
				var level = null, model = null, entities = null;
				window.defaultId = world.id;
				for (var i in world.levels) {
					level = world.levels[i];
					window.levels.push({ id : level.id, camera : level.camera });
					model = window.levels.last();
					entities = model.get("entities");
					for (var i in level.entities)
						entities.add(level.entities[i]);
				}
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