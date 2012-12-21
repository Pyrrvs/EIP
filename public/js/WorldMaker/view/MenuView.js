define(["class", "text!/template/accordion.tpl", "text!/template/accordion_inner_li.tpl", "model/LevelModel"],
		function(Class, accordion, _class) {

	var EntityTabView = Backbone.View.extend({

		el : $("#menuView #tab-entity"),

		events : {

			"validate #id" : "changeEntity",
			"change .entity-member" : "changeEntity",
			"click #body-type" : "changeEntity",
			'click input[type="checkbox"]' : "changeEntity",
		},

		initialize : function() {

			window.global.bind("change:entity", this.selectedEntityChanged, this);
			window.global.bind("change:run", this.runChanged, this);
		},

		runChanged : function(global, run) {

			this.$("*").attr("disabled", run == "play")
		},

		changeEntity : function(e) {

			var entity = window.global.get("entity"), opts = { silent : true };
			entity.set("enabled", this.$("#enable").attr("checked"));
			entity.set("id", this.$("#id").val());
			entity.set("class", this.$("#class button").first().text(), opts);
			entity.set("position", cc.ccp(parseFloat(this.$("#position-x").val()), parseFloat(this.$("#position-y").val())), opts);
			entity.set("rotation", parseFloat(this.$("#rotation").val()), opts);
			entity.set("scale", parseFloat(this.$("#scale").val()), opts);
			entity.get("body").set("type", parseInt(this.$('#body-type input:checked').attr("data-type")));
			entity.get("body").set("shown", this.$("#show-body-layer").attr("checked"));
			entity.get("model").set("shown", this.$("#show-model-layer").attr("checked"));
            entity.change();
		},

		selectedEntityChanged : function(global, entity) {

			if (entity) {
				entity.rebind("change", this.entityChanged, this, true);
				entity.get("body").rebind("change:shown", this.entityShownChanged, this);
				entity.get("model").rebind("change:shown", this.entityShownChanged, this, true);
			}
		},

		entityShownChanged : function(body, shown) {

			var entity = window.global.get("entity"), opts = { silent : true };
			this.$("#show-model-layer").attr("checked", entity.get("model").get("shown"));
			this.$("#show-body-layer").attr("checked", entity.get("body").get("shown"));
		},

		entityChanged : function(entity, opts) {

			this.$("#enable").attr("checked", entity.get("enabled"));
			this.$("#id").val(entity.get("id"));
			this.$("#class button").first().text(entity.get("class"));
			this.$("#position-x").val(entity.get("position").x);
			this.$("#position-y").val(entity.get("position").y);
			this.$("#rotation").val(entity.get("rotation"));
			this.$("#scale").val(entity.get("scale"));
			this.$('#body-type input[data-type="' + entity.get("body").get("type") + '"]').attr("checked", true);
			this.$('#body-type :not(input[data-type="' + entity.get("body").get("type") + '"])').attr("checked", false);
		},
	});

	var LevelTabView = Backbone.View.extend({

		el : $("#menuView #tab-level"),

		events : {

			"validate #id" : "changeLevel",
			"change .entity-member" : "changeCamera",
			'click .toggle-layers' : "toggleLayers",
		},

		initialize : function() {

			window.global.bind("change:level", this.selectedLevelChanged, this);
			window.global.bind("change:run", this.runChanged, this);
		},

		runChanged : function(global, run) {

			this.$("*").attr("disabled", run == "play")
		},

		changeLevel : function(e) {

			var level = window.global.get("level")
			level.set("id", this.$("#id").val());
		},

		toggleLayers : function(e) {

			var type = e.target.id, level = window.global.get("level"), shown = !level.get("entities").find(function(entity) {
				return (!entity.get(type).get("shown"));
			});
			level.get("entities").each(function(entity) { entity.get(type).set("shown", !shown); });
		},

		changeCamera : function(e) {

			var level = window.global.get("level"), camera = level.get("camera"), opts = { silent : true };
			
			camera.set("position", cc.ccp(parseFloat(this.$("#position-x").val()), parseFloat(this.$("#position-y").val())), opts);
			camera.set("rotation", parseFloat(this.$("#rotation").val()), opts);
			camera.set("scale", parseFloat(this.$("#scale").val()), opts);
            camera.change();
		},

		selectedLevelChanged : function(global, level) {

			if (level) {
				window.global.get("level").rebind("change", this.levelChanged, this, true);
				window.global.get("level").get("camera").rebind("change", this.cameraChanged, this, true);
			}
		},

		levelChanged : function(level, opts) {

			this.$("#id").val(level.get("id"));
		},

		cameraChanged : function(camera, opts) {

			this.$("#position-x").val(camera.get("position").x);
			this.$("#position-y").val(camera.get("position").y);
			this.$("#rotation").val(camera.get("rotation"));
			this.$("#scale").val(camera.get("scale"));
		},
	});

	var TabsView = Backbone.View.extend({

		el : $("#menuView"),

		initialize : function() {

			$("body").attr('unselectable','on').css('UserSelect','none').css('MozUserSelect','none');
			$("#postWorld").click(window.controller.postWorld);
			this.$('#tabs a[href="#tab-entity"]').parent().addClass("disabled");
			this.$('#tabs a[href="#tab-level"]').parent().addClass("disabled");
			this.$('#tabs a[href="#tab-classes"]').tab("show");

			window.global.bind("change:entity", this.selectedEntityChanged, this);
			window.global.bind("change:level", this.selectedLevelChanged, this);
			window.global.bind("change:mode", this.modeChanged, this);
		},

		selectedEntityChanged : function(global, entity) {

			if (entity) {
				this.$('#tabs a[href="#tab-entity"]').parent().removeClass("disabled");
				this.$('#tabs a[href="#tab-entity"]').tab("show");
			} else
				this.$('#tabs a[href="#tab-entity"]').parent().addClass("disabled");
		},

		selectedLevelChanged : function(global, level) {

			if (level) {
				this.$('#tabs a[href="#tab-level"]').parent().removeClass("disabled");
				this.$('#tabs a[href="#tab-level"]').tab("show");
			} else {
				this.$('#tabs a[href="#tab-level"]').parent().addClass("disabled");
				this.$('#tabs a[href="#tab-classes"]').tab("show");
			}
		},

		modeChanged : function(global, mode) {

			if (mode == "camera")
				this.$('#tabs a[href="#tab-level"]').tab("show");
			else if (mode == "entity")
				this.$('#tabs a[href="#tab-entity"]').tab("show");
		},
	});

	new TabsView;
	new LevelTabView;
	new EntityTabView;
});