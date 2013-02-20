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

	var createLevel = '$("#id").val(arguments[0]).trigger("validate");'.t(100);
	var selectLevel = '$("#levelView .accordion-heading a").eq(arguments[0]).click();'.t(50);
	var createEntity = '$("#levelView .accordion-heading").eq(arguments[0]).find(".icon-add").click();'.t(100);
	var selectEntity = '$("#levelView .accordion-body").first().find("li a").eq(arguments[0]).click();'.t(80);
	var selectCreateFixture = '$("#add-fixture").trigger("select", arguments[0]).change();'.t(50);
	var clickCreateFixture = '$("#add-fixture button:first").click();'.t(100);
	var moveEntity = '$("#position-x:first").val(arguments[0]).change(); $("#position-y:first").val(arguments[1]).change();'.t(80);
	var save = '$("#save").click();'.t(200);
	var	load = 'App.controller.getWorld(function() { });'.t(200);
	var radius = '$("#radius").val(arguments[0]).change()'.t(80);
	var selectType = '$("#body-type").trigger("select", arguments[0]).change();'.t(80);
	var moveVertex = '$(".fixture").eq(arguments[0]).find(".vertex").eq(arguments[1]).find("#position-x").val(arguments[2]).change().parent().find("#position-y").val(arguments[3]).change()'.t(100);
	var play = '$("#play").click()'.t(3000);
	var quickPlay = '$("#play").click()'.t(1000);
	var stop = '$("#stop").click()'.t(80);
	var pause = '$("#pause").click()'.t(1000);
	var display = 'log.apply(null, arguments)'.t(50);
	var newTest = 'testTimer = 0;'.t(0);

	function createFixture(type) {

		selectCreateFixture(type);
		clickCreateFixture();
	}

	function testCreate6Circles() {

		createLevel("1");
		selectLevel(0);

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
		// createEntity(0);
		// selectEntity(0);
	}

	function testResetServer() {

		App.set("levels", null);
		save();
		load();
	}

	testFull();
	// testCreate6Circles();
	// test1Polygon();
	// testBase();
	// testBaseEmpty();
	// load();

	selectEntity(0);

	// quickPlay();
	play();
	pause();
	play();
	stop();
	quickPlay();
	pause();
	quickPlay();
	quickPlay();
	pause();
	quickPlay();
	quickPlay();
	pause();
	stop();
	// 'log(App.get("entity"))'.t(50)();
});
