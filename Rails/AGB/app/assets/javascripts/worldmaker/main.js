_.templateSettings.variable = "g";
require.config({ paths : {

	"text" : "/assets/util/text",
	"class" : "/assets/util/class",
} })

define(["model/LevelModel", "controller/Controller", "view/LevelView", "view/MenuView", "view/GameView"], function(App) {

	window.App = App;

	new_test({

		createLevel : '$("#levelView #id").val(arguments[0]).trigger("validate");',
		selectLevel : '$("#levelView .accordion-heading a").eq(arguments[0]).click();',
		createEntity : '$("#levelView .accordion-heading").eq(arguments[0]).find(".icon-add").click();',
		selectEntity : '$("#levelView .accordion-body").first().find("li a").eq(arguments[0]).click();',
		selectCreateFixture : '$("#add-fixture").trigger("select", arguments[0]).change();',
		clickCreateFixture : '$("#add-fixture button:first").click();',
		moveEntity : '$("#section-charac #position-x").val(arguments[0]).parent().parent().find("#position-y").val(arguments[1]).change();',
		createVertex : '$(".fixture").eq(arguments[0]).find(".icon-add").click();',
		model : '$("#models li a").eq(arguments[0]).click();',
		save : '$("#save").click();',
		load : 'App.controller.getWorld($.noop);',
		radius : '$("#radius").val(arguments[0]).change()',
		scale : '$("#section-charac #scale-x").val(arguments[0]).parent().parent().find("#scale-y").val(arguments[0]).change();',
		rotation : '$("#section-charac #rotation").val(arguments[0]).change();',
		type : '$("#body-type").trigger("select", arguments[0]).change();',
		moveVertex : '$(".fixture").eq(arguments[0]).find(".vertex").eq(arguments[1]).find("#position-x").val(arguments[2]).parent().find("#position-y").val(arguments[3]).change()',
		moveFixture : '$(".fixture").eq(arguments[0]).find("#position-x:first").val(arguments[1]).parent().find("#position-y:first").val(arguments[2]).change();',
		play : 'console.log("play"); $("#play").click(); $.noop.async(1000)();',
		quickPlay : '$("#play").click(); $.noop.async(1000)();',
		stop : 'console.log("stop"); $("#stop").click(); $.noop.async(1000)();',
		pause : '$("#pause").click()',
		display : 'log.apply(null, arguments)',
	});

	function createFixture(type) {

		selectCreateFixture(type);
		clickCreateFixture();
	}

	function setup_base() {

		load();
		selectLevel(0);
		selectEntity(0);			
	}

	function test_base() {

		it("should select first level and first entity");
			setup_base();
	}

	function reset_server() {

		App.set("levels", null);
		save();
		load();
	}

	function setup_empty() {

		createLevel("1");
		selectLevel(0);
	}

	function create_ball(x, y, s, r) {

		x = _.undef(x, kge.Random.int(100, 550));
		y = _.undef(y, kge.Random.int(100, 450));
		s = _.undef(s, kge.Random(0.5, 1.5));
		r = _.undef(r, kge.Random.int(0, 360));
		createEntity(0);
		moveEntity(x, y);
		type(2);
		createFixture(0);
		radius(32);
		scale(s);
		rotation(r);
		model(0);
	}

	function create_crate(x, y, s, r) {

		x = _.undef(x, kge.Random.int(100, 550));
		y = _.undef(y, kge.Random.int(100, 450));
		s = _.undef(s, kge.Random(0.3, 0.6));
		r = _.undef(r, kge.Random.int(0, 360));
		createEntity(0);
		moveEntity(x, y);
		type(2);
		createFixture(1);
		createVertex(0);
		moveVertex(0, 0, -64, -64);
		moveVertex(0, 1, 64, -64);
		moveVertex(0, 2, 64, 64);
		moveVertex(0, 3, -64, 64);
		scale(s);
		rotation(r);
		model(1);
	}

	function create_ground() {

		createEntity(0);
		moveEntity(20, 20);
		createFixture(1);
		moveVertex(0, 1, 600, 0);
		createFixture(1);
		moveVertex(1, 2, 0, 400);
		createFixture(1);
		moveFixture(2, 600, 0);
		moveVertex(2, 2, 0, 400);
	}

	function test_single_ball() {

		it("should create a level and a single ball");
			setup_empty();
			create_ground();
			create_ball(void 0, void 0, 1);
			selectEntity(1);
	}

	function test_single_crate() {

		it("should create a level and a single crate");
			setup_empty();
			create_ground();
			create_crate(void 0, void 0, 1);
			selectEntity(1);
	}

	function test_full() {

		it("should create a level, 3 platforms and x circle/triangles");
			setup_empty();
			create_ground();
			for (var i = 0; i < 20; ++i)
				eval("create_" + (i % 2 ? "ball" : "crate") + "()");
			selectEntity(0);
	}

	begin_test();
		// test_single_crate();
		// test_single_ball();
		// test_full();
		test_base();
	end_test();
});
