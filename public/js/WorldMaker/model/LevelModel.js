define(["model/EntityModel"], function() {

	window.CameraModel = Backbone.Model.extend({

		initialize : function(attr) {

			attr = this.attributes;
			if (!(attr.position instanceof cc.Point))
				this.set("position", cc.Point.fromObject(attr.position));
		},

		defaults : function() { return {

			scale : 1,
			rotation : 0,
			position : cc.ccp(0, 0)
		}}
	})

	var LevelModel = Backbone.Model.extend({

		initialize : function(attr) {

			if (!(attr.camera instanceof CameraModel))
				this.set("camera", new CameraModel(attr.camera), { silent : true });
		},

		defaults : function() { return {

			id : null,
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

		addLevel : function(id) {

			if (id != "" && !this.where({ id : id }).length)
				this.add(new this.model({ id : id }));
		}
	});

	window.levels = new LevelCollection;
	window.global = new GlobalModel;
})