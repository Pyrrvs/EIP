define(["class", "text!/template/accordion.tpl", "text!/template/accordion_inner_li.tpl"],
		function(Class, accordion, entity) {

	LevelView = Class.extend({

		$ : $("#levelView"),
		tpl_accordion : null,
		tpl_entity : null,
		currentLevel : null,
		currentEntity : {},
		levels : null,

		init : function() {

			this.tpl_accordion = _.template(accordion);
			this.tpl_entity = _.template(entity);
			this.levels = controller.getLevel();
			for (var i in this.levels)
				this.newLevel(this.levels[i]);
			this.$.find("#create").click(function(e) {
				var name = $(e.target).parent().find("#name").val(), level = controller.createLevel({ level : name });
				if (level) {
					this.newLevel(level);
					this.levels = controller.getLevel();
				}
			}.bind(this)).parent().find("#name").keydown(function(e) {
				if (e.keyCode == 13)
					$(e.target).parent().find("#create").click();
			});

//			this.$.find(".accordion-heading").eq(0).find("a").click();

			// BEBUG

			// var timer = setInterval(function() {
			// 	this.$.find(".accordion-heading").eq(0).find("a").click();
			// 	clearInterval(timer);
			// 	timer = setInterval(function() {
			// 		this.$.find(".accordion-inner").eq(0).find("li").first().find("a").click();
			// 	clearInterval(timer);
			// 	}.bind(this), 500);
			// }.bind(this), 500);

			// !DEBUG
		},

		newLevel : function(level) {

			var n = this.$.find(".accordion-group").size();
			this.$.find("#levelList").append(this.tpl_accordion({ id : "level", name : level.name, n : n, parent : "levelList" }));
			this.$.find(".accordion-heading").eq(n).data("level", level).find("a").click(function(e) {
				var level = this.$.find(".accordion-heading").index($(e.target).parent());
				gameView.setUpLevel($(e.target).parent().data("level"), level != this.currentLevel);
				this.currentLevel = level;
				this.currentEntity = {};
				this.$.find("#levelList .accordion-inner li a").css("border-width", "0");
			}.bind(this)).parent().find(".btn").hide().first().click(function(e) {
				var a = $(e.target).parent().parent().find("a"), name = a.text();
				var entity = controller.createEntity({ level : name });
				this.newEntity(entity, this.$.find(".accordion-toggle").index(a), name);
			}.bind(this)).next().click(function(e) {
				controller.deleteLevel({ name : $(e.target).parent().parent().find("a").text() });
				$(e.target).parent().parent().parent().remove();
			});
			this.$.find(".accordion-heading").eq(n).hover(function(e) {
				// if ($(e.target).parent().next().hasClass("in"))
				// 	$(e.target).parent().find(".btn").first().stop().show();
				$(e.target).parent().find(".btn").last().stop().show();
			}, function(e) {
				$(e.target).parent().find(".btn").stop().hide();
			});
			for (var i in level.entities)
				this.newEntity(level.entities[i], n, level.name);
		},

		newEntity : function(entity, n, level) {

			this.$.find("#levelList ul").eq(n).append(this.tpl_entity({ name : entity.id })).find("li").last()
				.data({entity : entity, level : level}).find("a").click(function(e) {
				this.$.find("#levelList .accordion-inner li a").css("border-width", "0");
				var entity = $(e.target).css("border-width", "1px").parent().data("entity");
				if (entity.id != this.currentEntity.id) {
					this.currentEntity = entity;
					menuView.entityTab.setEntity(entity);
					gameView.selectEntity(entity);
				}
			}.bind(this));
			this.$.find("#levelList ul").eq(n).find(".btn :last").hide().click(function(e) {
				controller.deleteEntity({ entity : $(e.target).parent().data() });
				$(e.target).parent().remove();
			});
			this.$.find("#levelList ul").eq(n).find("li :last").hover(function(e) {
				$(e.target).parent().find(".btn").stop().show();
			}, function(e) {
				$(e.target).parent().find(".btn").stop().hide();
			});
		},

		updateEntity : function(id) {

			this.$.find(".accordion-inner").eq(this.currentLevel).find("li").eq(this.currentEntity.id).find("a").text(id);
			this.currentEntity.id = id;			
		},

		selectEntity : function(id) {

			if (id != this.currentEntity.id)
				this.$.find(".accordion-inner").eq(this.currentLevel).find("li").each(function(i, e) {
					if ($(e).data("entity").id == id)
						$(e).find("a").click();
				})
		},
	});

	return (function() { return new LevelView } );
})