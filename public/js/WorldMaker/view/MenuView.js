define(["class", "text!/template/accordion.tpl", "text!/template/accordion_inner_li.tpl", "text!/template/vertice.tpl",
	"text!/template/circle.tpl", "text!/template/polygon.tpl", "model/LevelModel"],
	function(Class, tpl_accordion, tpl_class, tpl_vertice, tpl_circle, tpl_polygon) {

	var EntityTabView = Backbone.View.extend({

		el : $("#menuView #tab-entity"),
		tpl_vertice : _.template(tpl_vertice),
		tpl_circle : _.template(tpl_circle),
		tpl_polygon : _.template(tpl_polygon),

		events : {

			"validate #id" : "changeEntity",
			"change #collapse-charac .entity-member" : "changeEntity",
			'click #body-type input[type="radio"]' : "changeEntity",
			'click input[type="checkbox"]' : "changeEntity",
			"change #collapse-body .entity-member" : "changeEntityFixture",
		},

		initialize : function() {

			window.global.bind("change:entity", this.selectedEntityChanged, this);
			window.global.bind("change:run", this.runChanged, this);
		},

		runChanged : function(global, run) {

			this.$("*").attr("disabled", run == "play")
		},

		changeEntityFixture : function(e) {

			var entity = window.global.get("entity"), opts = { silent : true }, $fixture = $(e.target).closest(".fixture"),
				fixture = entity.get("body").get("fixtures").at($.inArray($fixture[0], this.$(".fixture")));
			fixture.unbind("change", this.entityFixtureChanged, this);
			fixture.set("position", cc.ccp(parseFloat($fixture.find("#position-x").val()), parseFloat($fixture.find("#position-y").val())), opts);
			if (fixture.get("type") == b2Shape.e_circleShape) {
				$fixture.find("#radius").val(Math.minimize($fixture.find("#radius").val(), 0.1));
				fixture.set("shape", $fixture.find("#radius").val(), opts);
			} else if (fixture.get("type") == b2Shape.e_polygonShape) {
				var vertice = $(e.target).closest(".vertice")[0], pos = $(vertice).find("input");
				if (vertice)
					fixture.get("shape").at($.inArray(vertice, $fixture.find(".vertice")))
						.set({ x : parseFloat(pos.val()), y : parseFloat(pos.next().val()) });
			}
			fixture.change();
			fixture.bind("change", this.entityFixtureChanged, this);
		},

		changeEntity : function(e) {

			var entity = window.global.get("entity"), opts = { silent : true };
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
			entity.rebind("change", this.entityChanged, this, true);
            entity.get("body").get("fixtures").rebind("add", this.fixtureAdded, this, true);
            entity.get("body").get("fixtures").rebind("remove", this.fixtureRemoved, this);
			entity.get("body").rebind("change:shown", this.entityShownChanged, this);
			entity.get("model").rebind("change:shown", this.entityShownChanged, this, true);
		},

		entityShownChanged : function(body, shown) {

			var entity = window.global.get("entity"), opts = { silent : true };
			if (!entity) return;
			this.$("#show-model-layer").attr("checked", entity.get("model").get("shown"));
			this.$("#show-body-layer").attr("checked", entity.get("body").get("shown"));
		},

		entityChanged : function(entity, opts) {

			this.$("#enable").attr("checked", entity.get("enabled"));
			this.$("#id").val(entity.get("id"));
			this.$("#class button").first().text(entity.get("class"));
			this.$("#position-x").val(entity.get("position").x);
			this.$("#position-y").val(entity.get("position").y);
			this.$("#rotation").val(entity.get("rotation"));
			this.$("#scale").val(entity.get("scale"));
			this.$('#body-type input[data-type="' + entity.get("body").get("type") + '"]').attr("checked", true);
		},

		fixtureAdded : function(fixture, fixtures) {

			if (fixture.get("type") == b2Shape.e_circleShape)
				this.$("#fixtures").append(this.tpl_circle());
			else if (fixture.get("type") == b2Shape.e_polygonShape) {
				this.$("#fixtures").append(this.tpl_polygon());
				fixture.get("shape").fixtures = fixtures;
				fixture.get("shape").rebind("add", this.verticeAdded, this, true);
				fixture.get("shape").rebind("remove", this.verticeRemoved, this);
			}
			fixture.fixtures = fixtures;
			fixture.rebind("change", this.entityFixtureChanged, this, true);
		},

		fixtureRemoved : function(fixture) {

			// TODO
		},

		verticeAdded : function(vertice, vertices) {

			this.$(".fixture").eq(vertices.fixtures.indexOf(vertices.fixtures.where({ shape : vertices })[0]))
				.append(this.tpl_vertice({ x : vertice.get("x"), y : vertice.get("y") }));
		},

		verticeRemoved : function(vertice) {

			// TODO
		},

		entityFixtureChanged : function(fixture) {

			var $fixture = this.$(".fixture").eq(fixture.fixtures.indexOf(fixture));
			fixture = fixture.attributes;
			$fixture.find("#position-x").eq(0).val(fixture.position.x);
			$fixture.find("#position-y").eq(0).val(fixture.position.y);
			if (fixture.type == b2Shape.e_circleShape)
				$fixture.find("#radius").val(fixture.shape);
			else if (fixture.type == b2Shape.e_polygonShape)
				fixture.shape.each(function(elem, i) {
					$fixture.find(".vertice").eq(i).find("position-x").val(elem.get("x")).parent().find("position-y").val(elem.get("y"));
				});
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

			window.global.bind("change:level", this.selectedLevelChanged, this);
			window.global.bind("change:run", this.runChanged, this);
		},

		runChanged : function(global, run) {

			this.$("*").attr("disabled", run == "play")
		},

		changeLevel : function(e) {

			var level = window.global.get("level")
			level.set("id", this.$("#id").val());
		},

		toggleLayers : function(e) {

			var type = e.target.id, level = window.global.get("level"), shown = !level.get("entities").find(function(entity) {
				return (!entity.get(type).get("shown"));
			});
			level.get("entities").each(function(entity) { entity.get(type).set("shown", !shown); });
		},

		changeCamera : function(e) {

			var level = window.global.get("level"), camera = level.get("camera"), opts = { silent : true };
			
			camera.set("position", cc.ccp(parseFloat(this.$("#position-x").val()), parseFloat(this.$("#position-y").val())), opts);
			camera.set("rotation", parseFloat(this.$("#rotation").val()), opts);
			camera.set("scale", parseFloat(this.$("#scale").val()), opts);
            camera.change();
		},

		selectedLevelChanged : function(global, level) {

			if (!level) return;
			window.global.get("level").rebind("change", this.levelChanged, this, true);
			window.global.get("level").get("camera").rebind("change", this.cameraChanged, this, true);
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
			$("#postWorld").click(window.controller.postWorld);
			this.$('#tabs a[href="#tab-entity"]').parent().addClass("disabled");
			this.$('#tabs a[href="#tab-level"]').parent().addClass("disabled");
			this.$('#tabs a[href="#tab-classes"]').tab("show");

			window.global.bind("change:entity", this.selectedEntityChanged, this);
			window.global.bind("change:level", this.selectedLevelChanged, this);
			window.global.bind("change:mode", this.modeChanged, this);
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