define(["class", "model/LevelModel"], function(Class, App) {

	var Controller = Class.extend({

		bools : "enabled shown".w,
		numbers : "x y rotation scale density restitution friction shape type".w,

		deserialize : function(data) {

			var nb = null;

			for (var i in data)
				if (_.isObject(data[i]))
					this.deserialize(data[i]);
				else if (_.include(this.numbers, i))
					data[i] = _.isNaN(nb = parseFloat(data[i])) ? data[i] : nb;
				else if (_.include(this.bools, i))
					data[i] = data[i] == "true" ? true : false;
		},

		getWorld : function(callback) {

			$.ajax(window.location.pathname + "/world", { type : "GET", dataType : "json", success : function(world) {
				if (world) {
					this.deserialize(world);
					for (var i in world.levels)
						App.get("levels").push(world.levels[i]);
				}
				callback();
			}.bind(this), error : function(log) {
				console.log(log);
				callback();
			}});
			return (this);
		},

		putWorld : function() {

			$("#save").text("saving ...");
			$.ajax(window.location.pathname + "/world", { type : "PUT", dataType : "json",
				data : { data : JSON.parse(JSON.stringify({ levels : App.get("levels").toJSON() } )) }, success : function(res) {
					$("#save").text("successfully saved !");
					(function() { $("#save").text("save"); }.async(1111))();
			}, error : function(log) {
					$("#save").text("save failed !");
					(function() { $("#save").text("save"); }.async(1111))();
			}});
		},
	});

	App.controller = new Controller;
});
