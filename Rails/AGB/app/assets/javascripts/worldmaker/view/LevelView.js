define(["class", "text!/assets/accordion.tpl", "text!/assets/accordion_inner_li.tpl", "model/LevelModel"],
		function(Class, accordion, entity) {

	var LevelView = Backbone.View.extend({

		el : $("#levelView"),
		tpl_accordion : _.template(accordion),
		tpl_entity : _.template(entity),

		events : {

			"click .add-icon" : "createLevel",
			"validate #id" : "createLevel",
			"mouseenter .accordion-heading" : "showButton",
			"mouseleave .accordion-heading" : "hideButton",
			"open .accordion-heading" : "selectLevel",
			"close .accordion-heading" : "deselectLevel",
			"click .accordion-heading .icon-add" : "createEntity",
			"click .accordion-heading .icon-delete" : "deleteLevel",
			"click .accordion-inner li a" : "selectEntity",
			"mouseenter .accordion-inner li" : "showButton",
			"mouseleave .accordion-inner li" : "hideButton",
			"click .accordion-inner .icon-delete" : "deleteEntity",
		},

		initialize : function() {

			App.levels.bind("add", this.levelAdded, this);
			App.levels.bind("remove", this.levelRemoved, this);
			App.global.bind("change:entity", this.selectedEntityChanged, this);
			App.global.bind("change:level", this.selectedLevelChanged, this);
		},

		levelAdded : function(level) {

			var n = App.levels.size() - 1, el = null;
			this.$("#levelList").append(this.tpl_accordion({ id_group : "level", parent : "levelList", id : level.get("id"), n : n }));
			this.$("#levelList .accordion-group").eq(n).find(".accordion-heading .btn").hide();
			level.get("entities").rebind("add", this.entityAdded, this, true);
			level.get("entities").bind("remove", this.entityRemoved, this);
		},

		createLevel : function() {

			App.levels.addLevel(this.$("#id").val());
		},

		showButton : function(e) {

			if ($(e.target).parent().hasClass("entity") || App.global.get("level")
				== App.levels.where({ id : $(e.target).parent().find("a").text() })[0])
				$(e.target).parent().find(".btn").show();
		},

		hideButton : function(e) {

			$(e.target).parent().find(".btn").hide();
		},

		deselectLevel : function(e, target) {

			App.global.set("level", null);
			$(target).parent().find(".btn").hide();
		},

		selectLevel : function(e, target) {

			App.global.set("level", App.levels.where({ id : $(target).text() })[0]);
			if ($(target).css("color") == "#005580")
				$(target).parent().find(".btn").show();
		},

		createEntity : function(e) {

			App.levels.where({ id : $(e.target).parent().parent().find("a").text() })[0].get("entities").add();
		},

		deleteLevel : function(e) {

			App.levels.remove(App.levels.where({ id : $(e.target).parent().parent().find("a").text() })[0]);
		},

		levelRemoved : function(level, levels, opts) {

			this.$(".accordion-group").eq(opts.index).remove();
		},

		entityAdded : function(entity, entities) {

			setTimeout(function() {
				var level = App.levels.where({ entities : entities })[0];
				var a = this.$("#levelList .accordion-group").eq(App.levels.indexOf(level))
					.find("ul").append(this.tpl_entity({ id : entity.get("id") })).find("li a:last");
				a.parent().find(".btn").hide();
				if (level == App.global.get("level"))
					a.click();
			}.bind(this));
		},

		selectedEntityChanged : function(global, entity) {

			var i = null, j = null;
			this.$("#levelList ul a").css("background-color", "");
			if (entity && (i = App.levels.indexOf(App.global.get("level"))) != -1
				&& (j = App.global.get("level").get("entities").indexOf(entity)) != -1) {
				entity.rebind("change:id", this.entityIdChanged, this);
				this.$("#levelList ul").eq(i).find("a").eq(j).css("background-color", "rgba(150, 150, 255, 0.2)");
			}
		},

		entityIdChanged : function(entity, id) {

			var i = null, j = null;
			if (entity && (i = App.levels.indexOf(App.global.get("level"))) != -1
				&& (j = App.global.get("level").get("entities").indexOf(entity)) != -1)			
				this.$("#levelList ul").eq(i).find("a").eq(j).text(entity.id);
		},

		selectedLevelChanged : function(global, level) {

			App.global.set("entity", null);
			if (!level) return;
			level.rebind("change:id", this.levelChanged, this);
		},

		levelChanged : function(level, id) {

			this.$("#levelList").eq(App.levels.indexOf(level)).find(".accordion-heading a").text(id);
		},

		selectEntity : function(e) {

			if (!App.global.get("level")) return;
			App.global.set("entity", App.global.get("level").get("entities").where({ id : $(e.target).text() })[0]);
		},

		deleteEntity : function(e) {

			var entities = App.global.get("level").get("entities"),
				entity = entities.where({ id : $(e.target).parent().find("a").text() })[0];
			if (App.global.get("entity") === entity)
				App.global.set("entity", null);
			entities.remove(entity);
		},

		entityRemoved : function(entity, level, opts) {

			this.$("#levelList ul").eq(App.levels.indexOf(App.global.get("level"))).find("a").eq(opts.index).parent().remove();
		},
	});

	new LevelView;
})
