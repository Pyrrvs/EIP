App = {};
_.templateSettings.variable = "g";
require.config({ paths : {

	"text" : "/assets/util/text",
	"class" : "/assets/util/class",
} })

define(["model/LevelModel", "controller/Controller", "view/LevelView", "view/MenuView", "view/GameView"], function(App) {

	var testTimer = 0;

	Function.prototype.test = function() {

		var time = arguments[0];
		Array.prototype.shift.call(arguments);
		if (time < 0) {
			time *= -1;
			this.apply(this, arguments);
		} else
			this.async(testTimer).apply(this, arguments);
		testTimer += time;
	};

	String.prototype.t = function(timeout) {

		var time = timeout, toEval = this, func = function() { log("%ctesting", 'color: green', toEval + ""); eval(toEval + ""); };
		return (function() {
			Array.prototype.unshift.call(arguments, time);
			func.test.apply(func, arguments);
		});
	};

	var createLevel = '$("#id").val(arguments[0]).trigger("validate");'.t(200),
		selectLevel = '$("#levelView .accordion-heading a").eq(arguments[0]).click();'.t(150),
		createEntity = '$("#levelView .accordion-heading").eq(arguments[0]).find(".icon-add").click();'.t(250),
		selectEntity = '$("#levelView .accordion-body").first().find("li a").eq(arguments[0]).click();'.t(150),
		selectCreateFixture = '$("#add-fixture").trigger("select", arguments[0]).change();'.t(50),
		clickCreateFixture = '$("#add-fixture button:first").click();'.t(150),
		moveEntity = '$("#section-charac #position-x").val(arguments[0]).parent().parent().find("#position-y").val(arguments[1]).change();'.t(50),
		save = '$("#save").click();'.t(220),
		load = 'App.controller.getWorld(function() { });'.t(220),
		radius = '$("#radius").val(arguments[0]).change()'.t(50),
		scale = '$("#section-charac #scale-x").val(arguments[0]).parent().parent().find("#scale-y").val(arguments[0]).change();'.t(50),
		selectType = '$("#body-type").trigger("select", arguments[0]).change();'.t(50),
		moveVertex = '$(".fixture").eq(arguments[0]).find(".vertex").eq(arguments[1]).find("#position-x").val(arguments[2]).parent().find("#position-y").val(arguments[3]).change()'.t(50),
		moveFixture = '$(".fixture").eq(arguments[0]).find("#position-x:first").val(arguments[1]).parent().find("#position-y:first").val(arguments[2]).change();'.t(50),
		play = '$("#play").click()'.t(3000),
		quickPlay = '$("#play").click()'.t(1000),
		stop = '$("#stop").click()'.t(150),
		pause = '$("#pause").click()'.t(1000),
		display = 'log.apply(null, arguments)'.t(50),
		newTest = 'testTimer = 0;'.t(0);

	''.t(200)();

	function createFixture(type) {

		selectCreateFixture(type);
		clickCreateFixture();
	}

	function testCreate6Circles() {

		testBaseEmpty();

		createEntity(0);
		createFixture(0);
		moveEntity(200, 400);
		selectType(2);

		createEntity(0);
		createFixture(0);
		moveEntity(320, 400);
		selectType(2);

		createEntity(0);
		createFixture(0);
		moveEntity(400, 400);
		selectType(2);

		createEntity(0);
		createFixture(0);
		moveEntity(190, 100);
		radius(60);

		createEntity(0);
		createFixture(0);
		moveEntity(300, 100);
		radius(60);

		createEntity(0);
		createFixture(0);
		moveEntity(420, 100);
		radius(60);
	}

	function test3Circles() {

		testBaseEmpty();

		createEntity(0);
		createFixture(0);
		selectType(2);
		moveEntity(200, 400);

		createEntity(0);
		createFixture(0);
		moveEntity(205, 300);

		createEntity(0);
		createFixture(0);
		moveEntity(100, 150);
	}

	function test1Polygon() {

		createEntity(0);
		createFixture(1);
		moveEntity(420, 300);
		moveVertex(0, 0, -200, -50);
	}

	function testBase() {

		load();
		selectLevel(0);
		selectEntity(0);
	}

	function testFull() {

		testBaseEmpty();

		createEntity(0);
		createFixture(0);
		moveEntity(450, 450);
		selectType(2);
		radius(20);

		createEntity(0);
		createFixture(0);
		moveEntity(400, 350);
		selectType(2);
		radius(10);

		createEntity(0);
		createFixture(0);
		moveEntity(500, 400);
		selectType(2);
		radius(20);

		createEntity(0);
		createFixture(0);
		moveEntity(400, 450);
		selectType(2);
		radius(10);

		createEntity(0);
		createFixture(0);
		moveEntity(500, 350);
		selectType(2);
		radius(20);

		createEntity(0);
		createFixture(1);
		moveEntity(600, 300);
		moveVertex(0, 0, -300, -50);

		createEntity(0);
		createFixture(1);
		moveEntity(100, 250);
		moveVertex(0, 1, 200, -150);

		createEntity(0);
		createFixture(1);
		moveEntity(20, 20);
		moveVertex(0, 1, 600, 0);
	}

	function testBaseEmpty() {

		createLevel("1");
		selectLevel(0);
	}

	function testResetServer() {

		App.set("levels", null);
		save();
		load();
	}

	function testInfinite() {

		testBaseEmpty();
		createEntity(0);
		moveEntity(20, 20);
		createFixture(1);
		moveVertex(0, 1, 600, 0);
		createFixture(1);
		moveVertex(1, 2, 0, 400);
		createFixture(1);
		moveFixture(2, 600, 0);
		moveVertex(2, 2, 0, 400);
		for (var i = 0; i < 42; ++i) {
			createEntity(0);
			selectType(2);
			createFixture(i % 2);
			scale(kge.Random(0.5, 2));
			moveEntity(kge.Random.int(50, 590), kge.Random.int(100, 450))
		}
		// play();
		// play();
		// play();
		// stop();
	}

	// testInfinite();
	// testFull();
	// testCreate6Circles();
	// test1Polygon();
	testBase();
	// testBaseEmpty();
	// createEntity(0);
	// createFixture(0);

	// load();

	// createEntity(0);
	// createFixture(0);
	// selectType(2);
	// scale(2);
	// moveEntity(300, 200);
	// ''.t(500)();	
	// quickPlay();
	// quickPlay();
	// stop();
	// play();
	// stop();

	// stop();
	selectEntity(0);
	// 'log(App.get("entity"))'.t(50)();
});
