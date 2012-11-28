var kNode = require('../../util/kNode.js');

var Controller = kNode.Controller.extend({

    config : {

    levels : [
        { name : "Green Hill", entities : [
            { id : 0, class : 'Mario', model : {url : "resource/ball.png"}, position : {x : 200, y : 200}, scale : 2, rotation : 0 },
            { id : 1, class : 'Plat1', model : {url : "resource/ball.png"}, position : {x : 400, y : 400}, scale : 1, rotation : 0 },
            { id : 2, class : 'Plat2', model : {url : "resource/ball.png"}, position : {x : 100, y : 100}, scale : 1.5, rotation : 0 },
            { id : 3, class : 'Soldier', model : {url : "resource/ball.png"}, position : {x : 300, y : 100}, scale : 1, rotation : 0 },
            { id : 4, class : 'Commander', model : {url : "resource/ball.png"}, position : {x : 100, y : 300}, scale : 1, rotation : 0 },
        ] },
        { name : "Marble" },
        { name : "Spring Yard" },
        { name : "Labyrinth" },
        { name : "Star Light" },
        { name : "Scrap Brain" }
    ],

    classes : [
        { name : 'Mario', group : 'Hero', bodyType : 'Dynamic' },
        { name : 'Plat1', group : 'Platforms', bodyType : 'Static' },
        { name : 'Plat2', group : 'Platforms', bodyType : 'Static' },
        { name : 'Plat3', group : 'Platforms', bodyType : 'Static' },
        { name : 'Soldier', group : 'Army', bodyType : 'Dynamic' },
        { name : 'Commander', group : 'Army', bodyType : 'Dynamic' },
        { name : 'General', group : 'Army', bodyType : 'Dynamic' },
    ],

    sprites : [
        "kGameEngine/../resource/ball.png",
        "kGameEngine/../resource/crate.jpg",
    ],

    id : 5,

    },

	ctor : function(app) {

		this.super(app, null);
        this.addRoute("/users/:username/:project/WorldMaker", "GET", this.getHome);
        this.addRoute("/users/:username/:project/WorldMaker", "POST", this.postHome);
        this.addRoute("/users/:username/:project/WorldMaker/update", "POST", this.update)
	},

    getHome : function(req, resp) {

        console.log("GET")
        resp.render("kWM.ejs");
    },    

    postHome : function(req, resp) {

        console.log("POST")
        resp.json(this.config);
    },

    update : function(req, resp) {

        this.data = JSON.parser(req.data);
    },
});

module.exports = function(app) {

	return (new Controller(app));
}