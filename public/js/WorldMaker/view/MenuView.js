define(["class", "text!/template/accordion.tpl", "text!/template/accordion_inner_li.tpl", "model/LevelModel"],
		function(Class, accordion, _class) {

	var EntityTabView = Backbone.View.extend({

		el : $("#tab-entity"),

		events : {

			"validate #id" : "changeEntity",
			"change .entity-member" : "changeEntity",
			"click #body-type" : "changeEntity",
		},

		initialize : function() {

			window.global.bind("change:entity", this.selectedEntityChanged, this);
			window.global.bind("change:run", this.runChanged, this);
			window.global.bind("change:layer", this.layerChanged, this);
		},

		runChanged : function(global, run) {

			run == "play" ? this.$("*").attr("disabled", "") : this.$("*").removeAttr("disabled");
		},

		changeEntity : function(e) {

			var entity = window.global.get("entity"), opts = { silent : true };
			if (!entity)
				return;
			entity.set("id", this.$("#id").val());
			entity.set("class", this.$("#class button").first().text(), opts);
			entity.set("position", cc.ccp(parseFloat(this.$("#position-x").val()),
				parseFloat(this.$("#position-y").val())), opts);
			entity.set("rotation", parseFloat(this.$("#rotation").val()), opts);
			entity.set("scale", parseFloat(this.$("#scale").val()), opts);
			var body = entity.get("body");
			body.type = parseInt(this.$(e.type == "click" ? e.target : '#body-type .active').attr("data-type"));
			entity.set("body", body, opts);
            entity.trigger("change", entity, {});
		},

		selectedEntityChanged : function(global, entity) {

			if (entity) {
				window.global.get("entity").unbind("change", this.entityChanged, this);
				window.global.get("entity").bind("change", this.entityChanged, this);
				this.entityChanged(window.global.get("entity"));
			}
		},

		entityChanged : function(entity, opts) {

			this.$("#id").val(entity.get("id"));
			this.$("#class button").first().text(entity.get("class"));
			this.$("#position-x").val(entity.get("position").x);
			this.$("#position-y").val(entity.get("position").y);
			this.$("#rotation").val(entity.get("rotation"));
			this.$("#scale").val(entity.get("scale"));
			this.$("#body-type .btn").removeClass("active").parent().find('[data-type="'
				+ entity.get("body").type + '"]').addClass("active");
		},
	});

	var TabsView = Backbone.View.extend({

		el : $("#tabsView"),

		initialize : function() {

			$("#postWorld").click(window.controller.postWorld);
			this.$('#tabs a[href="#tab-entity"]').parent().addClass("disabled");
			this.$('#tabs a[href="#tab-classes"]').tab("show");
			window.global.bind("change:entity", this.selectedEntityChanged, this);
		},

		selectedEntityChanged : function(global, entity) {

			if (entity) {
				this.$('#tabs a[href="#tab-entity"]').parent().removeClass("disabled");
				this.$('#tabs a[href="#tab-entity"]').tab("show");
			} else {
				this.$('#tabs a[href="#tab-entity"]').parent().addClass("disabled");
				this.$('#tabs a[href="#tab-classes"]').tab("show");
			}
		},
	});

	new TabsView;
	new EntityTabView;
});