define(["class", "text!/assets/accordion.tpl", "text!/assets/accordion_inner_li.tpl", "model/LevelModel"],
		function(Class, tpl_accordion, tpl_entity, App) {

	var LevelView = Backbone.View.extend({

		el : $("#levelView"),
		tpl_accordion : _.template(tpl_accordion),
		tpl_entity : _.template(tpl_entity),

		events : {

			"click .icon-add" : "createLevel",
			"validate #id" : "createLevel",
			"mouseenter .accordion-heading" : "showButton",
			"mouseleave .accordion-heading" : "hideButton",
			"kopen .accordion-heading" : "selectLevel",
			"kclose .accordion-heading" : "deselectLevel",
			"click .accordion-heading .icon-add" : "createEntity",
			"click .accordion-heading .icon-delete" : "deleteLevel",
			"click .accordion-inner li a" : "selectEntity",
			"mouseenter .accordion-inner li" : "showButton",
			"mouseleave .accordion-inner li" : "hideButton",
			"click .accordion-inner .icon-delete" : "deleteEntity",
			"click #save" : "saveWorld",
		},

		initialize : function() {

			App.get("levels").bind("add", this.levelAdded, this);
			App.get("levels").bind("remove", this.levelRemoved, this);
			App.bind("change:entity", this.selectedEntityChanged, this);
			App.bind("change:level", this.selectedLevelChanged, this);
		},

		levelAdded : function(level) {

			var n = App.get("levels").size() - 1, el = null;
			this.$("#levelList").append(this.tpl_accordion({ id_group : "level", parent : "levelList", id : level.get("id"), n : n }));
			this.$("#levelList .accordion-group").eq(n).find(".accordion-heading .btn").hide();
			level.get("entities").rebind("add", this.entityAdded, this, true);
			level.get("entities").bind("remove", this.entityRemoved, this);
		},

		createLevel : function() {

			App.get("levels").addLevel(this.$("#id").val());
		},

		showButton : function(e) {

			if ($(e.target).parent().hasClass("entity") || App.get("level")
				== App.get("levels").where({ id : $(e.target).parent().find("a").text() })[0])
				$(e.target).parent().find(".btn").show();
		},

		hideButton : function(e) {

			$(e.target).parent().find(".btn").hide();
		},

		deselectLevel : function(e) {

			App.set("level", null);
			$(e.target).find(".btn").hide();
		},

		selectLevel : function(e) {

			var $target = $(e.target).find("a");
			App.set("level", App.get("levels").where({ id : $target.text() })[0]);
			if ($target.css("color") == "#005580")
				$target.parent().find(".btn").show();
		},

		createEntity : function(e) {

			App.get("levels").where({ id : $(e.target).parent().parent().find("a").text() })[0].get("entities").add();
		},

		deleteLevel : function(e) {

			App.get("levels").remove(App.get("levels").where({ id : $(e.target).parent().parent().find("a").text() })[0]);
		},

		levelRemoved : function(level, levels, opts) {

			this.$(".accordion-group").eq(opts.index).remove();
		},

		entityAdded : function(entity, entities) {

				var level = App.get("levels").where({ entities : entities })[0];
				var a = this.$("#levelList .accordion-group").eq(App.get("levels").indexOf(level))
					.find("ul").append(this.tpl_entity({ id : entity.get("id") })).find("li a:last");
				a.parent().find(".btn").hide();
				this.$("#levelList").scrollTop(this.$("#levelList").height());
				if (level == App.get("level"))
					a.click();
		},

		selectedEntityChanged : function(global, entity) {

			var i = null, j = null;
			this.$("#levelList ul a").css("background-color", "");
			if (entity && (i = App.get("levels").indexOf(App.get("level"))) != -1
				&& (j = App.get("level").get("entities").indexOf(entity)) != -1) {
				entity.rebind("change:id", this.entityIdChanged, this);
				this.$("#levelList ul").eq(i).find("a").eq(j).css("background-color", "rgba(150, 150, 255, 0.2)");
			}
		},

		entityIdChanged : function(entity, id) {

			var i = null, j = null;
			if (entity && (i = App.get("levels").indexOf(App.get("level"))) != -1
				&& (j = App.get("level").get("entities").indexOf(entity)) != -1)			
				this.$("#levelList ul").eq(i).find("a").eq(j).text(entity.id);
		},

		selectedLevelChanged : function(global, level) {

			App.set("entity", null);
			if (!level) return;
			level.rebind("change:id", this.levelChanged, this);
		},

		levelChanged : function(level, id) {

			this.$("#levelList").eq(App.get("levels").indexOf(level)).find(".accordion-heading a").text(id);
		},

		selectEntity : function(e) {

			if (!App.get("level")) return;
			App.set("entity", App.get("level").get("entities").where({ id : $(e.target).text() })[0]);
		},

		deleteEntity : function(e) {

			var entities = App.get("level").get("entities"),
				entity = entities.where({ id : $(e.target).parent().find("a").text() })[0];
			if (App.get("entity") === entity)
				App.set("entity", null);
			entities.remove(entity);
		},

		entityRemoved : function(entity, level, opts) {

			this.$("#levelList ul").eq(App.get("levels").indexOf(App.get("level"))).find("a").eq(opts.index).parent().remove();
		},

		saveWorld : function() {

			App.controller.putWorld(App);
		},
	});

	new LevelView;
})
