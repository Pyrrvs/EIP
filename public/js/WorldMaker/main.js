_.templateSettings.variable = "g";
require.config({ paths : {

	"text" : "/js/util/text",
	"class" : "/js/util/class",
} })

define(["model/LevelModel", "controller/Controller", "view/LevelView", "view/MenuView", "view/GameView"], function() {

	window.controller.getWorld(function() {
		// debug
		setTimeout(function() {
			$("#levelView .accordion-heading a").first().click();
			setTimeout(function() {	$("#levelView .accordion-body").first().find("li a").first().click(); }, 200);
		});
		// !debug
	})
	$("#worldmaker").css("visibility", "visible").hide().fadeIn(500);
});
