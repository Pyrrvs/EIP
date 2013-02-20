define(["model/EntityModel"], function(EntityCollection) {

	var CameraModel = Backbone.Model.extend({

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
			if (!(attr.entities instanceof EntityCollection)) {
				var entities = new EntityCollection;
				_.each(attr.entities, function(entity) {
					entities.push(entity);
				});
				this.set("entities", entities, { silent : true });
			}
		},

		defaults : function() { return {

			id : null,
			camera : new CameraModel,
			entities : new EntityCollection,
		}},
	});

	var LevelCollection = Backbone.Collection.extend({

		model : LevelModel,

		addLevel : function(id) {

			if (id != "" && !this.where({ id : id }).length)
				this.add(new this.model({ id : id }));
		}
	});

	var AppModel = Backbone.Model.extend({

		defaults : function() { return {

			levels : new LevelCollection,
			highlightedFixture : null,
			level : null,
			entity : null,
			run : "stop",
			mode : "camera",
			scaling : 50,
		}},
	});

	var App = new AppModel;

	App.EntityCollection = EntityCollection;
	App.LevelCollection = LevelCollection;
	App.CameraModel = CameraModel;

	return (App);
})
