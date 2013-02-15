define(["model/EntityModel"], function() {

	App.CameraModel = Backbone.Model.extend({

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

			if (!(attr.camera instanceof App.CameraModel))
				this.set("camera", new App.CameraModel(attr.camera), { silent : true });
			if (!(attr.entities instanceof App.EntityCollection)) {
				var entities = new App.EntityCollection;
				_.each(attr.entities, function(entity) {
					entities.push(entity);
				});
				this.set("entities", entities, { silent : true });
			}
		},

		defaults : function() { return {

			id : null,
			camera : new App.CameraModel,
			entities : new App.EntityCollection,
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

	App.levels = new LevelCollection;
	App.global = new GlobalModel;
})
