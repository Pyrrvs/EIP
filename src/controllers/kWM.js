var kNode = require('../../util/kNode.js');

var Controller = kNode.Controller.extend({

    world : {

    levels : [
        { name : "Green Hill", camera : { zoom : 0.5 }, entities : [
            { id : "ball1", class : 'Circle', model : {url : "/img/ball.png"}, position : {x : 300, y : 500}, scale : 1, rotation : 0, circle : 32, body : 2 },
            { id : "crate", class : 'Box', model : {url : "/img/crate.jpg"}, position : {x : 350, y : 600}, scale : 0.5, rotation : 0, box : [32, 32], body : 2 },
            { id : "platform1", class : 'Platform', model : {box : [400 , 20]}, position : {x : 550, y : -100}, scale : 1, rotation : 0, box : [200, 10], body : 0 },
            { id : "platform2", class : 'Platform', model : {box : [400 , 20]}, position : {x : 150, y : 150}, scale : 1, rotation : 45, box : [200, 10], body : 0 },
            { id : "platform3", class : 'Platform', model : {box : [400 , 20]}, position : {x : 400, y : 450}, scale : 1, rotation : -45, box : [200, 10], body : 0 },
            { id : "platform4", class : 'Platform', model : {box : [150 , 20]}, position : {x : 800, y : 0}, scale : 1, rotation : -66, box : [75, 10], body : 0 },
        ] },
        { name : "Marble", camera : { zoom : 0.5 } },
        { name : "Spring Yard", camera : { zoom : 0.5 } },
        { name : "Labyrinth", camera : { zoom : 0.5 } },
        { name : "Star Light", camera : { zoom : 0.5 } },
        { name : "Scrap Brain", camera : { zoom : 0.5 } }
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

    id : 0,

    },

	ctor : function(app) {

		this.super(app, null);
        this.proj_contrl = new (require('./project.js'))(app);
        this.check_edit_perm = _.bind(this.check_edit_perm, this);
        this.addRoute("/users/:username/:project/WorldMaker", "GET", this.getHome, this.check_edit_perm);
        this.addRoute("/users/:username/:project/WorldMaker/getWorld", "GET", this.getWorld, this.check_edit_perm);
        this.addRoute("/users/:username/:project/WorldMaker/putWorld", "PUT", this.putWorld, this.check_edit_perm)
	},

    check_edit_perm : function(req, res, next) {
        next();
        return ;
        if (!helper.is_authenticated(req)) {
            res.send('<h1>Authentication needed!</h1>');
            return ;
        }
        this.proj_contrl.is_editable_by(req.params.project, req.params.username, req.user.username, function(err, is_editable) {
            if (err){
                res.send('<h1>An error occured when accessing the databse</h1><p>' + err + '</p>');
                return ;
            } else if (is_editable) {
                next();
            } else {
                res.send('<h1>Access Denied!</h1>');
            }
        });
    },

    getHome : function(req, resp) {
        resp.render("kWM.ejs");
    },    

    getWorld : function(req, resp) {

        resp.json(this.world);
    },

    putWorld : function(req, resp) {

        this.world = JSON.parser(req.data);
    },
});

module.exports = function(app) {

	return (new Controller(app));
}