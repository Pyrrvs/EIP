define([], function() {

	Backbone.Model.prototype.rebind = function(a, b, c, d) {

		this.unbind(a, b, c);
		this.bind(a, b, c);
		if (d)
			b.call(c, this);
	};

	Backbone.Collection.prototype.rebind = function(a, b, c) {

		this.unbind(a, b, c);
		this.bind(a, b, c);
	};

	var FixtureModel = Backbone.Model.extend({

		initialize : function(attr) {

			attr = this.attributes;
			if (attr.shape_type == "polygon" && attr.shape.v.length && !(attr.shape.v[0] instanceof b2Vec2)) {
				attr.shape.v = b2Vec2.verticesFromArray(attr.shape.v, 1);
				this.set("shape", attr.shape);
			}
		},

		defaults : function() { return {

            density : 1.0,
            friction : 1,
            restitution : 0.5,
            shape_type : null,
            shape : null,
		}}
	});

	var FixtureCollection = Backbone.Collection.extend({

		model : FixtureModel,
	});

	var BodyModel = Backbone.Model.extend({

		initialize : function(attr) {

			attr = this.attributes;
			this.set("fixture", new FixtureModel(attr.fixture));
		},

		defaults : function() { return {

			shown : true,
			type : 0,
			fixture : new FixtureModel,

//			multi fixtures
//			fixtures : new FixtureCollection,
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
			if (!attr.id)
				this.set("id", window.defaultId++);
			this.set("id", this.get("id") + "");
		},

		defaults : function() { return {

			id : null,
			enabled : "checked",
			position : cc.ccp(0, 0),
			scale : 1,
			rotation : 0,
			model : new ModelModel,
			body : new BodyModel,
		}},
	});

	window.EntityCollection = Backbone.Collection.extend({

		model : EntityModel,
	});
})