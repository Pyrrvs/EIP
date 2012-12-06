define(["class"], function(Class) {

	var Controller = Class.extend({

		getWorld : function(callback) {

			$.ajax(window.location.pathname + "/getWorld", { type : "GET", dataType : "json", success : function(data) {
				var world = data, level = null, model = null, entities;
				console.log(JSON.stringify(data));
				window.defaultId = data.id;
				for (var i in world.levels) {
					level = world.levels[i];
					window.levels.push({ name : level.name, camera : level.camera });
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

			var data = {
				levels : window.levels.toJSON(),
				id : window.defaultId,
			};

			console.log(JSON.stringify(data));
			$.ajax(window.location.pathname + "/postWorld", { type : "POST", dataType : "json", data : data, success : function(res) {
				console.log(res);
			}, error : function(log) { console.log(log); }});
		},
	});

	window.controller = new Controller;
});