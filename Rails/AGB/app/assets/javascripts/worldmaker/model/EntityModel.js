define([], function() {

	var FixtureModel = Backbone.Model.extend({

		initialize : function(attr) {

			attr = this.attributes;
			this.set("position", cc.Point.fromObject(attr.position));
			if (attr.type == b2Shape.e_polygonShape) {
				var vertices = new Backbone.Collection;
				_.each(attr.shape, function(elem) { vertices.push(elem); });
				this.set("shape", vertices);
				vertices.fixture = this;
			}
		},

		defaults : function() { return {

            density : 1.0,
            friction : 1,
            restitution : 0.5,
            type : null,
            shape : null,
            position : cc.ccp(0, 0),
		}}
	});

	var FixtureCollection = Backbone.Collection.extend({

		model : FixtureModel,
	});

	var BodyModel = Backbone.Model.extend({

		initialize : function(attr) {

			var fixtures = new FixtureCollection;
			attr = this.attributes;
			_.each(attr.fixtures, function(elem) { fixtures.push(new FixtureModel(elem)); });
			this.set("fixtures", fixtures);
		},

		defaults : function() { return {

			type : 0,
			shown : true,
			fixtures : new FixtureCollection,
		}}
	});

	var ModelModel = Backbone.Model.extend({

		defaults : function() { return {

			shown : true,
			path : null,
		}}
	});

	var EntityModel = Backbone.Model.extend({

		initialize : function(attr) {

			this.set("body", new BodyModel(attr.body));
			this.set("model", new ModelModel(attr.model));
			this.set("position", cc.Point.fromObject(attr.position));
			this.set("id", attr.id);
		},

		defaults : function() { return {

			id : "noname",
			enabled : "checked",
			position : cc.ccp(0, 0),
			scale : 1,
			rotation : 0,
			model : new ModelModel,
			body : new BodyModel,
		}},
	});

	return (Backbone.Collection.extend({

		model : EntityModel,
	}));
})
