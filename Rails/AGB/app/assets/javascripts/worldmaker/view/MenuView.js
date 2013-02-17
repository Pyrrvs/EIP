define(["class", "text!/assets/accordion.tpl", "text!/assets/accordion_inner_li.tpl", "text!/assets/vertex.tpl",
	"text!/assets/circle.tpl", "text!/assets/polygon.tpl", "model/LevelModel"],
	function(Class, tpl_accordion, tpl_class, tpl_vertex, tpl_circle, tpl_polygon) {

	var EntityTabView = Backbone.View.extend({

		el : $("#menuView #tab-entity"),
		tpl_accordion : _.template(tpl_accordion),
		tpl_vertex : _.template(tpl_vertex),
		tpl_circle : _.template(tpl_circle),
		tpl_polygon : _.template(tpl_polygon),

		events : {

			"validate #id" : "changeEntity",
			"mouseenter .accordion-heading" : "showButton",
			"mouseleave .accordion-heading" : "hideButton",
			"change #collapse-charac .entity-member" : "changeEntity",
			'click #body-type input[type="radio"]' : "changeEntity",
			'click input[type="checkbox"]' : "changeEntity",
			"change #collapse-body .entity-member" : "changeEntityFixture",
			"click .fixture .accordion-heading .icon-delete" : "deleteFixture",
			"click .polygon .accordion-heading .icon-add" : "addVertex",
			"click .polygon .fixture-body .vertices .icon-delete" : "deleteVertex",
		},

		initialize : function() {
	
			this.nbFixtures = 0;
			App.global.bind("change:entity", this.selectedEntityChanged, this);
			App.global.bind("change:run", this.runChanged, this);
		},

		showButton : function(e) {

			$(e.target).parent().find(".btn").show();
		},

		hideButton : function(e) {

			$(e.target).parent().find(".btn").hide();
		},

		runChanged : function(global, run) {

			this.$("*").attr("disabled", run == "play")
		},

		changeEntityFixture : function(e) {

			var entity = App.global.get("entity"), opts = { silent : true }, $fixture = $(e.target).closest(".fixture-body"),
				fixture = entity.get("body").get("fixtures").at($.inArray($fixture[0], this.$(".fixture-body"))), $vertex = null;
			fixture.unbind("change", this.entityFixtureChanged, this);
			fixture.set("position", cc.ccp(parseFloat($fixture.find("#position-x").val()),
				parseFloat($fixture.find("#position-y").val())), opts);
			if (fixture.get("type") == b2Shape.e_circleShape) {
				$fixture.find("#radius").val(Math.minimize($fixture.find("#radius").val(), 0.1));
				fixture.set("shape", $fixture.find("#radius").val(), opts);
			} else if (fixture.get("type") == b2Shape.e_polygonShape && ($vertex = $(e.target).closest(".vertex")).length)
				fixture.get("shape").at($fixture.find(".vertex").index($vertex))
					.set({ x : parseFloat($vertex.find("#position-x").val()), y : parseFloat($vertex.find("#position-y").val()) });
			fixture.change();
			fixture.bind("change", this.entityFixtureChanged, this);
		},

		changeEntity : function(e) {

			var entity = App.global.get("entity"), opts = { silent : true };
			entity.unbind("change", this.entityChanged, this);
			entity.set("enabled", !!this.$("#enable").attr("checked"));
			entity.set("id", this.$("#id").val());
			entity.set("class", this.$("#class button").first().text(), opts);
			entity.set("position", cc.ccp(parseFloat(this.$("#position-x").val()), parseFloat(this.$("#position-y").val())), opts);
			entity.set("rotation", parseFloat(this.$("#rotation").val()), opts);
			entity.set("scale", parseFloat(this.$("#scale").val()), opts);
			entity.get("body").set("type", parseInt(this.$('#body-type input:checked').attr("data-type")));
			entity.get("body").set("shown", !!this.$("#show-body-layer").attr("checked"));
			entity.get("model").set("shown", !!this.$("#show-model-layer").attr("checked"));
            entity.change();
			entity.bind("change", this.entityChanged, this);
		},

		selectedEntityChanged : function(global, entity) {

			if (!entity) return;
			this.$("#fixtures *").remove();
//			this.$(".collapse").slice(1).collapse("hide");
			entity.rebind("change", this.entityChanged, this, true);
            entity.get("body").get("fixtures").rebind("add", this.fixtureAdded, this, true);
            entity.get("body").get("fixtures").rebind("remove", this.fixtureRemoved, this);
			entity.get("body").rebind("change:shown", this.entityShownChanged, this);
			entity.get("model").rebind("change:shown", this.entityShownChanged, this, true);
		}.async(),

		entityShownChanged : function(body, shown) {

			var entity = App.global.get("entity"), opts = { silent : true };
			if (!entity) return;
			this.$("#show-model-layer").attr("checked", entity.get("model").get("shown"));
			this.$("#show-body-layer").attr("checked", entity.get("body").get("shown"));
		}.async(),

		entityChanged : function(entity, opts) {

			this.$("#enable").attr("checked", entity.get("enabled"));
			this.$("#id").val(entity.get("id"));
			this.$("#class button").first().text(entity.get("class"));
			this.$("#position-x").val(entity.get("position").x);
			this.$("#position-y").val(entity.get("position").y);
			this.$("#rotation").val(entity.get("rotation"));
			this.$("#scale").val(entity.get("scale"));
			this.$('#body-type input[data-type="' + entity.get("body").get("type") + '"]').attr("checked", true);
		}.async(),

		deleteFixture : function(e) {

			var fixtures = App.global.get("entity").get("body").get("fixtures");
			fixtures.remove(fixtures.at(this.$(".fixture").index($(e.target).closest(".fixture"))));
		},

		addVertex : function(e) {

			App.global.get("entity").get("body").get("fixtures").at(this.$(".fixture").
				index($(e.target).closest(".fixture"))).get("shape").add({ x : 0, y : 0 });
		},

		deleteVertex : function(e) {

			var idx = this.$(".fixture").index($(e.target).closest(".fixture")),
				vertices = App.global.get("entity").get("body").get("fixtures").at(idx).get("shape");
			vertices.remove(vertices.at(this.$(".fixture").eq(idx).find(".vertex").index($(e.target).closest(".vertex"))));
		},

		fixtureAdded : function(fixture, fixtures) {

			var $fixture = null;
			if (fixture.get("type") == b2Shape.e_circleShape)
				this.$("#fixtures").append(this.tpl_circle({ n : ++this.nbFixtures }));
			else if (fixture.get("type") == b2Shape.e_polygonShape) {
				this.$("#fixtures").append(this.tpl_polygon({ n : ++this.nbFixtures }));
				fixture.get("shape").fixtures = fixtures;
				fixture.get("shape").rebind("add", this.vertexAdded, this, true);
				fixture.get("shape").rebind("remove", this.vertexRemoved, this);
			}
			fixture.fixtures = fixtures;
			fixture.rebind("change", this.entityFixtureChanged, this, true);
			this.$("#fixtures .accordion-heading").last().find(".btn").hide();

			//debug
			this.$(".collapse").last().collapse("show");
		}.async(),

		fixtureRemoved : function(fixture, fixtures) {

			this.$("#fixtures *").remove();
            fixtures.body.entity.model.get("body").get("fixtures").rebind("add", this.fixtureAdded, this, true);
		}.async(),

		vertexChanged : function(vertex, vertices) {

			vertices = vertex.collection;
			this.$(".fixture-body .vertices").eq(vertices.fixtures.indexOf(vertices.fixtures.where({ shape : vertices })[0]))
				.find(".vertex").eq(vertices.indexOf(vertex)).find("#position-x")
				.val(vertex.get("x")).parent().find("#position-y").val(vertex.get("y"))
		}.async(),

		vertexAdded : function(vertex, vertices) {

			this.$(".fixture-body .vertices").eq(vertices.fixtures
				.indexOf(vertices.fixtures.where({ shape : vertices })[0])).append(this.tpl_vertex());
			vertex.rebind("change", this.vertexChanged, this, true);
		}.async(),

		vertexRemoved : function(vertex, vertices) {

			var scroll = this.$el.scrollTop();
 			this.$(".fixture-body .vertices").eq(vertices.fixtures
				.indexOf(vertices.fixtures.where({ shape : vertices })[0])).find("*").remove();
			vertex.fixture.get("shape").rebind("add", this.vertexAdded, this, true);
			setTimeout(function() {
				this.$el.scrollTop(scroll);
			}.bind(this));
		}.async(),

		entityFixtureChanged : function(fixture) {

			var $fixture = this.$(".fixture-body").eq(fixture.fixtures.indexOf(fixture));
			fixture = fixture.attributes;
			$fixture.find("#position-x").eq(0).val(fixture.position.x);
			$fixture.find("#position-y").eq(0).val(fixture.position.y);
			if (fixture.type == b2Shape.e_circleShape)
				$fixture.find("#radius").val(fixture.shape);
			else if (fixture.type == b2Shape.e_polygonShape)
				fixture.shape.each(function(elem, i) {
					$fixture.find(".vertex").eq(i).find("position-x").val(elem.get("x"))
						.parent().find("position-y").val(elem.get("y"));
				});
		}.async(),
	});

	var LevelTabView = Backbone.View.extend({

		el : $("#menuView #tab-level"),

		events : {

			"validate #id" : "changeLevel",
			"change .entity-member" : "changeCamera",
			'click .toggle-layers' : "toggleLayers",
		},

		initialize : function() {

			App.global.bind("change:level", this.selectedLevelChanged, this);
			App.global.bind("change:run", this.runChanged, this);
		},

		runChanged : function(global, run) {

			this.$("*").attr("disabled", run == "play")
		},

		changeLevel : function(e) {

			var level = App.global.get("level")
			level.set("id", this.$("#id").val());
		},

		toggleLayers : function(e) {

			var type = e.target.id, level = App.global.get("level"), shown = !level.get("entities").find(function(entity) {
				return (!entity.get(type).get("shown"));
			});
			level.get("entities").each(function(entity) { entity.get(type).set("shown", !shown); });
		},

		changeCamera : function(e) {

			var level = App.global.get("level"), camera = level.get("camera"), opts = { silent : true };
			
			camera.set("position", cc.ccp(parseFloat(this.$("#position-x").val()), parseFloat(this.$("#position-y").val())), opts);
			camera.set("rotation", parseFloat(this.$("#rotation").val()), opts);
			camera.set("scale", parseFloat(this.$("#scale").val()), opts);
            camera.change();
		},

		selectedLevelChanged : function(global, level) {

			if (!level) return;
			App.global.get("level").rebind("change", this.levelChanged, this, true);
			App.global.get("level").get("camera").rebind("change", this.cameraChanged, this, true);
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
			$("#postWorld").click(App.controller.postWorld);
			this.$('#tabs a[href="#tab-entity"]').parent().addClass("disabled");
			this.$('#tabs a[href="#tab-level"]').parent().addClass("disabled");
			this.$('#tabs a[href="#tab-classes"]').tab("show");

			App.global.bind("change:entity", this.selectedEntityChanged, this);
			App.global.bind("change:level", this.selectedLevelChanged, this);
			App.global.bind("change:mode", this.modeChanged, this);
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

			this.$('#tabs a[href="#tab-' + (mode == "camera" ? "level" : "entity") + '"]').tab("show");
		},
	});

	new TabsView;
	new LevelTabView;
	new EntityTabView;
});
