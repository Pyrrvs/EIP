define(["class", "text!/template/accordion.tpl", "text!/template/accordion_inner_li.tpl"],
		function(Class, accordion, entity) {

	LevelView = Class.extend({

		$ : $("#levelView"),
		tpl_accordion : null,
		tpl_entity : null,

		init : function() {

			this.tpl_accordion = _.template(accordion);
			this.tpl_entity = _.template(entity);
			var data = controller.getLevel();
			for (var i in data)
				this.newLevel(data[i]);
			// this.$.find(".accordion-heading").eq(0).find("a").click();
			// this.$.find(".accordion-inner").eq(0).find("li").first().find("a").click();
		},

		newLevel : function(level) {

			var n = this.$.find(".accordion-group").size();
			this.$.find("#levelList").append(this.tpl_accordion({ id : "level", name : level.name, n : n, parent : "levelList" }));
			this.$.find(".accordion-heading").eq(n).data("level", level).find("a").click(function(e) {
				gameView.setUpLevel($(e.target).parent().data("level"));
			}).parent().find(".btn").hide().first().click(function(e) {
				var a = $(e.target).parent().parent().find("a"), name = a.text();
				var data = controller.createEntity({ level : name });
				this.newEntity(data, this.$.find(".accordion-toggle").index(a), name);
			}).next().click(function(e) {
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
				$(e.target).css("border-width", "1px");
				menuView.entityTab.setEntity($(e.target).parent().data("entity"));
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
	});

	return (function() { return new LevelView } );
})