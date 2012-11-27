define(["view/LevelView", "view/GameView", "view/MenuView", "Controller"], function(LevelView, GameView, MenuView, Controller) {

	_.templateSettings.variable = "rc";
	window.controller = Controller().setUp(function() {
		window.gameView = GameView();
		window.menuView = MenuView();
		window.levelView = LevelView();		
		$("#kWM").css("visibility", "visible").hide().fadeIn(500);		
	});
});
