App = {};
_.templateSettings.variable = "g";
require.config({ paths : {

	"text" : "/assets/util/text",
	"class" : "/assets/util/class",
} })

define(["model/LevelModel", "controller/Controller", "view/LevelView", "view/MenuView", "view/GameView"], function(App) {

	function debug() {

		$("#levelView .accordion-heading a").first().click();
		(function() { 
			$("#levelView .accordion-body").first().find("li a").eq(0).click();
		}.async(300))();
	};

	App.controller.getWorld(function() {

		debug.asyncCall();
  	});
});

