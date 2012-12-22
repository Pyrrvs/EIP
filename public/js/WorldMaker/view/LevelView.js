define(["class", "text!/template/accordion.tpl", "text!/template/accordion_inner_li.tpl", "model/LevelModel"],
		function(Class, accordion, entity) {

	var LevelView = Backbone.View.extend({

		el : $("#levelView"),
		tpl_accordion : _.template(accordion),
		tpl_entity : _.template(entity),

		events : {

			"click #create" : "createLevel",
			"validate #id" : "createLevel",
			"mouseenter .accordion-heading" : "showButton",
			"mouseleave .accordion-heading" : "hideButton",
			"open .accordion-heading" : "selectLevel",
			"close .accordion-heading" : "deselectLevel",
			"click .accordion-heading #create" : "createEntity",
			"click .accordion-heading #delete" : "deleteLevel",
			"click .accordion-inner li a" : "selectEntity",
			"mouseenter .accordion-inner li" : "showButton",
			"mouseleave .accordion-inner li" : "hideButton",
			"click .accordion-inner #delete" : "deleteEntity",
		},

		initialize : function() {

			window.levels.bind("add", this.levelAdded, this);
			window.levels.bind("remove", this.levelRemoved, this);
			window.global.bind("change:entity", this.selectedEntityChanged, this);
			window.global.bind("change:level", this.selectedLevelChanged, this);
		},

		levelAdded : function(level) {

			var n = window.levels.size() - 1, el = null;
			this.$("#levelList").append(this.tpl_accordion({ id_group : "level", parent : "levelList", id : level.get("id"), n : n }));
			this.$("#levelList .accordion-group").eq(n).find(".accordion-heading .btn").hide();
			level.get("entities").rebind("add", this.entityAdded, this, true);
			level.get("entities").bind("remove", this.entityRemoved, this);
		},

		createLevel : function() {

			window.levels.addLevel(this.$("#id").val());
		},

		showButton : function(e) {

			$(e.target).parent().find(".btn").show();
		},

		hideButton : function(e) {

			$(e.target).parent().find(".btn").hide();
		},

		deselectLevel : function(e, target) {

			window.global.set("level", null);
		},

		selectLevel : function(e, target) {

			window.global.set("level", window.levels.where({ id : $(target).text() })[0]);
		},

		createEntity : function(e) {

			window.levels.where({ id : $(e.target).parent().parent().find("a").text() })[0].get("entities").add();
		},

		deleteLevel : function(e) {

			window.levels.remove(window.levels.where({ id : $(e.target).parent().parent().find("a").text() })[0]);
		},

		levelRemoved : function(level, levels, opts) {

			this.$(".accordion-group").eq(opts.index).remove();
		},

		entityAdded : function(entity, entities) {

			setTimeout(function() {
				var level = window.levels.where({ entities : entities })[0];
				var a = this.$("#levelList .accordion-group").eq(window.levels.indexOf(level))
					.find("ul").append(this.tpl_entity({ id : entity.get("id") })).find("li a:last");
				a.parent().find(".btn").hide();
				if (level == window.global.get("level"))
					a.click();
			}.bind(this));
		},

		selectedEntityChanged : function(global, entity) {

			var i = null, j = null;
			this.$("#levelList ul a").css("background-color", "");
			if (entity && (i = window.levels.indexOf(window.global.get("level"))) != -1
				&& (j = window.global.get("level").get("entities").indexOf(entity)) != -1) {
				entity.rebind("change:id", this.entityIdChanged, this);
				this.$("#levelList ul").eq(i).find("a").eq(j).css("background-color", "rgba(150, 150, 255, 0.2)");
			}
		},

		entityIdChanged : function(entity, id) {

			var i = null, j = null;
			if (entity && (i = window.levels.indexOf(window.global.get("level"))) != -1
				&& (j = window.global.get("level").get("entities").indexOf(entity)) != -1)			
				this.$("#levelList ul").eq(i).find("a").eq(j).text(entity.id);
		},

		selectedLevelChanged : function(global, level) {

			window.global.set("entity", null);
			if (!level) return;
			level.rebind("change:id", this.levelChanged, this);
		},

		levelChanged : function(level, id) {

			this.$("#levelList").eq(window.levels.indexOf(level)).find(".accordion-heading a").text(id);
		},

		selectEntity : function(e) {

			if (!window.global.get("level")) return;
			window.global.set("entity", window.global.get("level").get("entities").where({ id : $(e.target).text() })[0]);
		},

		deleteEntity : function(e) {

			var entities = window.global.get("level").get("entities"),
				entity = entities.where({ id : $(e.target).parent().find("a").text() })[0];
			if (window.global.get("entity") === entity)
				window.global.set("entity", null);
			entities.remove(entity);
		},

		entityRemoved : function(entity, level, opts) {

			this.$("#levelList ul").eq(window.levels.indexOf(window.global.get("level"))).find("a").eq(opts.index).parent().remove();
		},
	});

	new LevelView;
})