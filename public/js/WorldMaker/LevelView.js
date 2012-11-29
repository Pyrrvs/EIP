define(["class", "text!/template/accordion.tpl", "text!/template/accordion_inner_li.tpl"],
		function(Class, accordion, entity) {

	LevelView = Class.extend({

		$ : $("#levelView"),
		tpl_accordion : null,
		tpl_entity : null,
		currentLevel : null,
		currentEntity : {},

		init : function() {

			this.tpl_accordion = _.template(accordion);
			this.tpl_entity = _.template(entity);
			var data = controller.getLevel();
			for (var i in data)
				this.newLevel(data[i]);

			// BEBUG

			var timer = setInterval(function() {
				this.$.find(".accordion-heading").eq(0).find("a").click();
				clearInterval(timer);
				timer = setInterval(function() {
					this.$.find(".accordion-inner").eq(0).find("li").first().find("a").click();
				clearInterval(timer);
				}.bind(this), 300);
			}.bind(this), 300);

			// !DEBUG
		},

		newLevel : function(level) {

			var n = this.$.find(".accordion-group").size();
			this.$.find("#levelList").append(this.tpl_accordion({ id : "level", name : level.name, n : n, parent : "levelList" }));
			this.$.find(".accordion-heading").eq(n).data("level", level).find("a").click(function(e) {
				gameView.setUpLevel($(e.target).parent().data("level"));
				this.currentLevel = this.$.find(".accordion-heading").index($(e.target).parent());
			}.bind(this)).parent().find(".btn").hide().first().click(function(e) {
				var a = $(e.target).parent().parent().find("a"), name = a.text();
				var data = controller.createEntity({ level : name });
				this.newEntity(data, this.$.find(".accordion-toggle").index(a), name);
				$(e.target).parent().parent().parent().find("li").last().find("a").click();
			}.bind(this)).next().click(function(e) {
				controller.deleteLevel({ name : $(e.target).parent().parent().find("a").text() });
				$(e.target).parent().parent().parent().remove();
			});
			this.$.find(".accordion-heading").eq(n).hover(function(e) {
				$(e.target).parent().find(".btn").stop().show();
			}, function(e) {
				$(e.target).parent().find(".btn").stop().hide();
			});
			for (var i in level.entities)
				this.newEntity(level.entities[i], n, level.name);
		},

		newEntity : function(entity, n, level) {

			this.$.find("#levelList ul").eq(n).append(this.tpl_entity({ name : entity.id })).find("li :last")
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