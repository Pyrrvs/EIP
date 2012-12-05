define(["class", "text!/template/accordion.tpl", "text!/template/accordion_inner_li.tpl", "model/LevelModel"],
		function(Class, accordion, entity) {

	var LevelView = Backbone.View.extend({

		el : $("#levelView"),
		tpl_accordion : _.template(accordion),
		tpl_entity : _.template(entity),

		events : {

			"click #create" : "createLevel",
			"validate #name" : "createLevel",
			"mouseenter .accordion-heading" : "showButton",
			"mouseleave .accordion-heading" : "hideButton",
			"open .accordion-heading" : "selectLevel",
			"close .accordion-heading" : "deselectLevel",
			"click .accordion-heading .btn:first" : "createEntity",
			"click .accordion-heading #delete" : "deleteLevel",
			"click .accordion-inner li a" : "selectEntity",
			"mouseenter .accordion-inner li" : "showButton",
			"mouseleave .accordion-inner li" : "hideButton",
			"click .accordion-inner li .btn" : "deleteEntity",
		},

		initialize : function() {

			window.levels.bind("add", this.levelAdded, this);
			window.levels.bind("remove", this.levelRemoved, this);
			window.global.bind("change:entity", this.selectedEntityChanged, this);
			window.global.bind("change:level", this.selectedLevelChanged, this);
		},

		levelAdded : function(level) {

			level.get("entities").bind("add", this.entityAdded, this);
			level.get("entities").bind("remove", this.entityRemoved, this);
			var n = window.levels.size() - 1, el = null;
			this.$("#levelList").append(this.tpl_accordion({ id : "level", name : level.get("name"), n : n, parent : "levelList" }));
			el = this.$("#levelList .accordion-group").eq(n);
			el.find(".accordion-heading .btn").hide();
		},

		createLevel : function() {

			window.levels.addLevel(this.$("#name").val());
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

			window.global.set("level", window.levels.where({ name : $(target).text() })[0]);
		},

		createEntity : function(e) {

			var level = window.levels.where({ name : $(e.target).parent().parent().find("a").text() })[0];
			level.get("entities").add({});
		},

		deleteLevel : function(e) {

			window.levels.remove(window.levels.where({ name : $(e.target).parent().parent().find("a").text() })[0]);
		},

		levelRemoved : function(level, levels, opts) {

			this.$(".accordion-group").eq(opts.index).remove();
		},

		entityAdded : function(entity, entities) {

			var n = window.levels.indexOf(window.levels.where({ entities : entities })[0]);
			var el = this.$("#levelList .accordion-group").eq(n);
			el.find("ul").append(this.tpl_entity({ name : entity.id })).find(".btn").hide();
		},

		selectedEntityChanged : function(global, entity) {

			var i = null, j = null;
			this.$("#levelList ul a").css("border-width", "0px");
			if (entity && (i = window.levels.indexOf(window.global.get("level"))) != -1
				&& (j = window.global.get("level").get("entities").indexOf(entity)) != -1)
				this.$("#levelList ul").eq(i).find("a").eq(j).css("border-width", "1px");
		},

		selectedLevelChanged : function(global, level) {

			window.global.set("entity", null);
		},

		selectEntity : function(e) {

			var entity = window.global.get("level").get("entities").where({ id : $(e.target).text() })[0]
			window.global.set("entity", entity);
		},

		deleteEntity : function(e) {

			var entities = window.global.get("level").get("entities"),
				entity = entities.where({ id : $(e.target).parent().find("a").text() })[0];
			if (window.global.get("entity") === entity)
				window.global.set("entity", null);
			entities.remove(entity);
		},

		entityRemoved : function(entity, level, opts) {

			var i = window.levels.indexOf(window.global.get("level"));
			this.$("#levelList ul").eq(i).find("a").eq(opts.index).parent().remove();
		},
	});

	new LevelView;
})