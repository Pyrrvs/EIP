define(["class"], function(Class) {

	var Controller = Class.extend({

		data : null,

		getWorld : function(callback) {

			$.ajax(window.location.pathname + "/getWorld", { type : "GET", dataType : "json", success : function(data) {
				var world = data, level = null, model = null, entities;
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

		updateWorld : function(req) {

			$.ajax(window.location.pathname + "/postWorld", { type : "POST", dataType : "json", data : this.data, success : function(data) {
				console.log("Update Ok");
			}});
		},
	});

	window.controller = new Controller;
});