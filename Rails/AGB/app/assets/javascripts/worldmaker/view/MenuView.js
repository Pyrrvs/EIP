define(["class", "text!/assets/accordion.tpl", "text!/assets/accordion_inner_li.tpl", "text!/assets/vertex.tpl",
	"text!/assets/circle.tpl", "text!/assets/polygon.tpl", "model/LevelModel"],
	function(Class, tpl_accordion, tpl_class, tpl_vertex, tpl_circle, tpl_polygon, App) {

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
			'change #body-type' : "changeEntity",
			'click input[type="checkbox"]' : "changeEntity",
			"change #collapse-body .entity-member" : "changeEntityFixture",
			"click .fixture .accordion-heading .icon-delete" : "deleteFixture",
			"click .polygon .accordion-heading .icon-add" : "addVertex",
			"click .polygon .fixture-body .vertices .icon-delete" : "deleteVertex",
			"mouseenter .fixture" : "highlightFixture",
			"mouseleave .fixture" : "unhighlightFixture",
			"click #add-fixture button:first" : "createFixture",
		},

		initialize : function() {
	
			this.nbFixtures = 0;
			App.bind("change:entity", this.selectedEntityChanged, this);
			App.bind("change:run", this.runChanged, this);
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

			var entity = App.get("entity"), $fixture = $(e.target).closest(".fixture-body"),
				fixture = entity.get("body").get("fixtures").at($.inArray($fixture[0], this.$(".fixture-body"))), $vertex = null;
			fixture.set("position", cc.ccp(parseFloat($fixture.find("#position-x").val()),
				parseFloat($fixture.find("#position-y").val())));
			if (fixture.get("type") == b2Shape.e_circleShape) {
				$fixture.find("#radius").val(Math.minimize(parseFloat($fixture.find("#radius").val()), 0.1));
				fixture.set("shape", parseFloat($fixture.find("#radius").val()));
			} else if (fixture.get("type") == b2Shape.e_polygonShape && ($vertex = $(e.target).closest(".vertex")).length)
				fixture.get("shape").at($fixture.find(".vertex").index($vertex))
					.set({ x : parseFloat($vertex.find("#position-x").val()), y : parseFloat($vertex.find("#position-y").val()) });
		},

		changeEntity : function(e) {

			var entity = App.get("entity");
			entity.set("enabled", !!this.$("#enable").prop("checked"));
			entity.set("id", this.$("#id").val());
			entity.set("class", this.$("#class button").first().text());
			entity.set("position", cc.ccp(parseFloat(this.$("#position-x").val()), parseFloat(this.$("#position-y").val())));
			entity.set("rotation", parseFloat(this.$("#rotation").val()));
			entity.set("scale", cc.ccp(parseFloat(this.$("#scale-x").val()), parseFloat(this.$("#scale-y").val())));
			entity.get("body").set("type", parseInt(this.$('#body-type').val()));
			entity.get("body").set("shown", !!this.$("#show-body-layer").prop("checked"));
			entity.get("model").set("shown", !!this.$("#show-model-layer").prop("checked"));
		},

		selectedEntityChanged : function(global, entity) {

			var prev = global.previous("entity");
			if (prev) {
				prev.unbind("change", this.entityChanged, this);
				prev.get("model").unbind("change", this.entityModelChanged, this);
				prev.get("body").unbind("change", this.entityBodyChanged, this);
	            prev.get("body").get("fixtures").unbind("add", this.fixtureAdded, this, this);
	            prev.get("body").get("fixtures").unbind("remove", this.fixtureRemoved, this);
	            prev.get("body").get("fixtures").cleanup(this.cleanupFixture, this);
			}
			if (!entity) return;
			this.$("#fixtures *").remove();
			entity.rebind("change", this.entityChanged, this, true);
			entity.get("model").rebind("change", this.entityModelChanged, this, true);
			entity.get("body").rebind("change", this.entityBodyChanged, this, true);
            entity.get("body").get("fixtures").rebind("add", this.fixtureAdded, this, true);
            entity.get("body").get("fixtures").rebind("remove", this.fixtureRemoved, this);
		},

		entityModelChanged : function(model) {

			this.$("#show-model-layer").prop("checked", model.get("shown"));
		},

		entityBodyChanged : function(body) {

			this.$('#body-type').trigger("select", body.get("type"));
			this.$("#show-body-layer").prop("checked", body.get("shown"));
		},

		entityChanged : function(entity) {

			this.$("#enable").prop("checked", entity.get("enabled"));
			this.$("#id").val(entity.get("id"));
			this.$("#class button").first().text(entity.get("class"));
			this.$("#position-x").val(entity.get("position").x);
			this.$("#position-y").val(entity.get("position").y);
			this.$("#rotation").val(entity.get("rotation"));
			this.$("#scale-x").val(entity.get("scale").x);
			this.$("#scale-y").val(entity.get("scale").y);
		}.async(),

		deleteFixture : function(e) {

			var fixtures = App.get("entity").get("body").get("fixtures");
			fixtures.remove(fixtures.at(this.$(".fixture").index($(e.target).closest(".fixture"))));
		},

		addVertex : function(e) {

			App.get("entity").get("body").get("fixtures").at(this.$(".fixture").
				index($(e.target).closest(".fixture"))).get("shape").add({ x : 0, y : 0 });
		},

		deleteVertex : function(e) {

			var idx = this.$(".fixture").index($(e.target).closest(".fixture")),
				vertices = App.get("entity").get("body").get("fixtures").at(idx).get("shape");
			vertices.remove(vertices.at(this.$(".fixture").eq(idx).find(".vertex").index($(e.target).closest(".vertex"))));
		},

		createFixture : function() {

			var type = parseInt(this.$("#add-fixture").val()), entity = App.get("entity"), shape;
			type = _.isNaN(type) ? 0 : type;
			if (type == b2Shape.e_circleShape)
				shape = 10;
			else if (type == b2Shape.e_polygonShape)
				shape = { 0 : { x : -10, y : -10 }, 1 : { x : 10, y : -10 }, 2 : { x : 0, y : 10 } };
			entity.get("body").get("fixtures").add({ type : type, shape : shape });
		},

		fixtureAdded : function(fixture, fixtures) {

			var $fixture = null;
			fixture.fixtures = fixtures;
			if (fixture.get("type") == b2Shape.e_circleShape) {
				this.$("#fixtures").append(this.tpl_circle({ n : ++this.nbFixtures }));
				fixture.rebind("change", this.fixtureChanged, this, true);
			} else if (fixture.get("type") == b2Shape.e_polygonShape) {
				this.$("#fixtures").append(this.tpl_polygon({ n : ++this.nbFixtures }));
				fixture.get("shape").fixtures = fixtures;
				fixture.rebind("change", this.fixtureChanged, this, true);
				fixture.get("shape").rebind("add", this.vertexAdded, this, true);
				fixture.get("shape").rebind("remove", this.vertexRemoved, this);
			}
			this.$("#fixtures .accordion-heading").last().find(".btn").hide();
			this.$(".collapse").last().collapse("show");
		},

		fixtureChanged : function(fixture) {

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
		},

		fixtureRemoved : function(fixture, fixtures) {

			this.$("#fixtures *").remove();
			this.cleanupFixture(fixture);
            fixtures.rebind("add", this.fixtureAdded, this, true);
		},

		cleanupFixture : function(fixture) {

			if (fixture.get("shape") instanceof Backbone.Collection) {
				fixture.get("shape").unbind("add", this.vertexAdded, this);
				fixture.get("shape").unbind("remove", this.vertexRemoved, this);
				fixture.get("shape").cleanup(this.cleanupVertex, this);
			}
			fixture.unbind("change", this.entityFixtureChanged, this);
		},

		vertexChanged : function(vertex) {

			var fixtures = vertex.fixture.fixtures;
			this.$(".fixture").eq(fixtures.indexOf(vertex.fixture))
				.find(".vertex").eq(vertex.vertices.indexOf(vertex)).find("#position-x")
				.val(vertex.get("x")).parent().find("#position-y").val(vertex.get("y"))
		}.async(),

		vertexAdded : function(vertex, vertices) {

			this.$(".fixture").eq(vertices.fixtures.indexOf(vertex.fixture)).find(".vertices").append(this.tpl_vertex());
			vertex.vertices = vertices;
			vertex.rebind("change", this.vertexChanged, this, true);
			this.$el.scrollTop(this.$el.height());
		},

		vertexRemoved : function(vertex, vertices) {

 			this.$(".fixture-body .vertices").eq(vertices.fixtures
				.indexOf(vertices.fixtures.where({ shape : vertices })[0])).find("*").remove();
			vertex.fixture.get("shape").rebind("add", this.vertexAdded, this, true);
			this.$el.scrollTop(this.$el.height());
			this.cleanupVertex(vertex);
		},

		cleanupVertex : function(vertex) {

			vertex.unbind("change", this.vertexChanged, this);
		},

		highlightFixture : function(e) {

			var entity = App.get("entity");
			if (!entity) return ;
        	App.set("highlightedFixture", entity.get("body").get("fixtures")
        		.at($(".fixture").index($(e.target).closest(".fixture"))));
		},

		unhighlightFixture : function() {

			App.set("highlightedFixture", null);
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

			App.bind("change:level", this.selectedLevelChanged, this);
			App.bind("change:run", this.runChanged, this);
		},

		runChanged : function(global, run) {

			this.$("*").attr("disabled", run == "play")
		},

		changeLevel : function(e) {

			var level = App.get("level")
			level.set("id", this.$("#id").val());
		},

		toggleLayers : function(e) {

			var type = e.target.id, level = App.get("level"), shown = !level.get("entities").find(function(entity) {
				return (!entity.get(type).get("shown"));
			});
			level.get("entities").each(function(entity) { entity.get(type).set("shown", !shown); });
		},

		changeCamera : function(e) {

			var level = App.get("level"), camera = level.get("camera");
			
			camera.set("position", cc.ccp(parseFloat(this.$("#position-x").val()), parseFloat(this.$("#position-y").val())));
			camera.set("rotation", parseFloat(this.$("#rotation").val()));
			camera.set("scale", parseFloat(this.$("#scale").val()));
		},

		selectedLevelChanged : function(global, level) {

			if (!level) return;
			App.get("level").rebind("change", this.levelChanged, this, true);
			App.get("level").get("camera").rebind("change", this.cameraChanged, this, true);
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
			this.$('#tabs a[href="#tab-entity"]').parent().addClass("disabled");
			this.$('#tabs a[href="#tab-level"]').parent().addClass("disabled");
			this.$('#tabs a[href="#tab-classes"]').tab("show");

			App.bind("change:entity", this.selectedEntityChanged, this);
			App.bind("change:level", this.selectedLevelChanged, this);
			App.bind("change:mode", this.modeChanged, this);
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
