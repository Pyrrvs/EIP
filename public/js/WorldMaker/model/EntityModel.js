define([], function() {

	var BodyModel = Backbone.Model.extend({

		defaults : function() { return {

			type : 0,
		}}
	});

	var EntityModel = Backbone.Model.extend({

		initialize : function() {

			if (!this.get("id"))
				this.set("id", window.defaultId++, { silent : true });
			this.set("id", this.get("id") + "");
		},

		defaults : function() { return {

			id : null,
			position : cc.ccp(0, 0),
			scale : 1,
			rotation : 0,
			model : {},
			body : { type : 0, box : { w : 0, h : 0 } }
		}},
	});

	window.EntityCollection = Backbone.Collection.extend({

		model : EntityModel,
	});
})