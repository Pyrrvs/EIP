_.templateSettings.variable = "g";
require.config({ paths : {

	"text" : "/js/util/text",
	"class" : "/js/util/class",
} })

define(["model/LevelModel", "controller/Controller", "view/LevelView", "view/MenuView", "view/GameView"], function() {

	window.controller.getWorld(function() {
		$("#levelView .accordion-heading a").first().click().parent().parent().find("li a").first().click();
		$("#gameView #entity").click();
	})
	$("#worldmaker").css("visibility", "visible").hide().fadeIn(500);
});
