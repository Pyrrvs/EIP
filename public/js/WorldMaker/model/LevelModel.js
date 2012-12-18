define(["model/EntityModel"], function() {

	var CameraModel = Backbone.Model.extend({

		defaults : function() { return {

			zoom : 1,
			position : cc.ccp(0, 0)
		}}
	})

	var LevelModel = Backbone.Model.extend({

		initialize : function(attr) {

			if (typeof attr.camera != CameraModel)
				this.set("camera", new CameraModel({ zoom : attr.camera.zoom,
					position : cc.Point.fromObject(attr.camera.position) }), { silent : true });
		},

		defaults : function() { return {

			name : null,
			camera : new CameraModel,
			entities : new window.EntityCollection,
		}},
	});

	var GlobalModel = Backbone.Model.extend({

		defaults : function() { return {

			level : null,
			entity : null,
			run : "stop",
			mode : "camera",
		}},
	});

	var LevelCollection = Backbone.Collection.extend({

		model : LevelModel,

		addLevel : function(name) {

			if (name != "" && !this.where({ name : name }).length)
				this.add(new this.model({ name : name }));
		}
	});

	window.levels = new LevelCollection;
	window.global = new GlobalModel;
})