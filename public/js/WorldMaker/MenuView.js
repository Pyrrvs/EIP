define(["class", "text!/template/accordion.tpl", "text!/template/accordion_inner_li.tpl"],
		function(Class, accordion, _class) {

	var EntityTabView = Class.extend({

		$ : $("#menuView #tab-entity"),

		init : function() {

			$("#update").click(function() {
				controller.update();
			});
			this.$.find("#save").click(function(e) {
			}.bind(this));
			this.$.find(".entity-member").change(this.updateEntity.bind(this));
			this.$.find("#name").change(function(e) {
				levelView.updateEntity($(e.target).val());
			});
			this.$.find("#type").click(function(e) {
				var entity = levelView.currentEntity, type = parseInt($(e.target).attr("data-type"));
				entity.body = type;
				gameView.getEntityById(entity.id).body.SetType(type);
			});			
		},

		updateEntity : function() {

			var entity = levelView.currentEntity;
			entity.position.x = parseInt(this.$.find("#position-x").val());
			entity.position.y = parseInt(this.$.find("#position-y").val());
			entity.scale = parseFloat(this.$.find("#scale").val());
			if (entity.scale < 0.05) {
				entity.scale = 0.05;
				this.$.find("#scale").val("0.05");
			} else if (entity.scale > 5) {
				entity.scale = 5;
				this.$.find("#scale").val("5");
			}
			entity.rotation = parseInt(this.$.find("#rotation").val());
			gameView.updateEntity(entity);
		},

		setEntity : function(entity) {

			$('#menuView #tabs a[href="#tab-entity"]').tab("show");
			this.$.find("#name").val(entity.id);
			this.$.find("#class button").first().text(entity.class);
			this.$.find("#position-x").val(entity.position.x);
			this.$.find("#position-y").val(entity.position.y);
			this.$.find("#scale").val(entity.scale);
			this.$.find("#rotation").val(entity.rotation);
			this.$.find("#type .btn").removeClass("active").parent().find('[data-type="' + entity.body + '"]').addClass("active");
		},
	});

	var MenuView = Class.extend({

		$ : $("#menuView"),
		tpl_accordion : null,
		tpl_class : null,
		entityTab : null,

		init : function() {

			this.tpl_accordion = _.template(accordion);
			this.tpl_class = _.template(_class);
			var data = controller.getClass();
			for (var i in data)
				this.newClass(data[i]);
			$('a[data-toggle="tab"]').tab();
			$('a[data-toggle="tab"] :first').tab("show");
			$('#tab-classes #name').keydown(function(e) {
				if (e.keyCode == 13)
					$('#tab-classes #create').click();
			}).parent().find("#create").click(function(e) {
				var input = $(e.target).parent().parent().find("#name");
				this.createGroup(input.val());
				input.val("");
			}.bind(this));
			$(".line-top").find("> *:not(:first)").css("margin-left", "10px");
			$("#tab-class #group ul").click(function(e) {
				$("#tab-class #group span").text(e.target.text);
			});
			this.entityTab = new EntityTabView();
		},

		_groupExists : function(groupName) {

			var n = -1;

			this.$.find("#tab-classes #groupsList .accordion-toggle").each(function(i, elem) {
				if (elem.text == groupName)
					n = i;
			})
			return (n);
		},

		createGroup : function(groupName) {

			var n = this.$.find("#tab-classes #groupsList .accordion-group").size();

			this.$.find("#tab-classes #groupsList").append(this.tpl_accordion({ id : "group", name : groupName, n : n, parent : "groupsList" }));
			this.$.find("#tab-classes .accordion-heading").eq(n).find(".btn").hide().click(function(e) {
				controller.deleteGroup({ group : $(e.target).parent().parent().find("a").text() });
				$(e.target).parent().parent().parent().remove();
			}.bind(this));
			this.$.find("#tab-classes .accordion-heading").eq(n).hover(function(e) {
				$(e.target).parent().find(".btn").stop().show();
			}, function(e) {
				$(e.target).parent().find(".btn").stop().hide();
			});
			this.$.find("#tab-class #group ul").append('<li><a tabindex="-1" href="#">' + groupName + '</a><li>');
			return (n);
		},

		newClass : function(_class) {

			var n = this._groupExists(_class.group);

			if (n == -1)
				n = this.createGroup(_class.group);
			this.$.find("#tab-classes #groupsList ul").eq(n).append(this.tpl_class({name : _class.name})).find("a :last").click(function(e) {
				this.$.find('#tabs a[href="#class"]').tab("show");
				this.$.find("#class #name").val(_class.name);
				this.$.find("#class #group span").text(_class.group);
			}.bind(this));
			this.$.find("#tab-classes #groupsList ul").eq(n).find(".btn :last").hide().click(function(e) {
				send("/deleteClass", { classes : [ $(e.target).parent().parent().find("a").text() ] });
				$(e.target).parent().parent().remove();
			}.bind(this));
			this.$.find("#tab-classes #groupsList ul").eq(n).find("li :last").hover(function(e) {
				$(e.target).parent().find(".btn").stop().show();
			}, function(e) {
				$(e.target).parent().find(".btn").stop().hide();
			});
		},

		newSprite : function(sprite) {

			$("#sprites ul").append('<div class="well well-small inline-top sprite"><img src="' + sprite + '" /></div>');
		},
	});

	return (function() { return new MenuView } );
});