var kNode = require('../../util/kNode.js');
var fs = require('fs');

var Controller = kNode.Controller.extend({

    world : {

    levels : [
        { "name" : "Green Hill", "camera" : { "zoom" : 0.5, position : {x : 0, y : 0} }, "entities" : [
            { id : "ball1", class : 'Circle', model : {url : "/img/ball.png"}, position : {x : 300, y : 500}, scale : 1, rotation : 0, body : { type : 2, circle : 32 } },
            { id : "crate", class : 'Box', model : {url : "/img/crate.jpg"}, position : {x : 350, y : 600}, scale : 0.5, rotation : 0, body : { type : 2, box : {w : 32, h : 32} } },
            { id : "platform1", class : 'Platform', model : {box : {w : 400 , h : 20}}, position : {x : 550, y : -100}, scale : 1, rotation : 0, body : { type : 0, box : {w : 200, h : 10 } } },
            { id : "platform2", class : 'Platform', model : {box : {w : 400 , h : 20}}, position : {x : 150, y : 150}, scale : 1, rotation : 45, body : { type : 0, box : {w : 200, h : 10 } } },
            { id : "platform3", class : 'Platform', model : {box : {w : 400 , h : 20}}, position : {x : 400, y : 450}, scale : 1, rotation : -45, body : { type : 0, box : {w : 200, h : 10 } } },
            { id : "platform4", class : 'Platform', model : {box : {w : 150 , h : 20}}, position : {x : 800, y : 0}, scale : 1, rotation : -66, body : { type : 0, box : {w : 75, h : 10 } } },
        ] },
        { "name" : "Marble", "camera" : { "zoom" : 0.5 }, "entities" : [
            { id : "platform1", class : 'Platform', model : {box : {w : 400 , h : 20}}, position : {x : 550, y : -100}, scale : 1, rotation : 0, body : { type : 0, box : {w : 200, h : 10 } } },
            { id : "platform2", class : 'Platform', model : {box : {w : 400 , h : 20}}, position : {x : 150, y : 150}, scale : 1, rotation : 45, body : { type : 0, box : {w : 200, h : 10 } } },
            { id : "platform3", class : 'Platform', model : {box : {w : 400 , h : 20}}, position : {x : 400, y : 450}, scale : 1, rotation : -45, body : { type : 0, box : {w : 200, h : 10 } } },
            { id : "platform4", class : 'Platform', model : {box : {w : 150 , h : 20}}, position : {x : 800, y : 0}, scale : 1, rotation : -66, body : { type : 0, box : {w : 75, h : 10 } } },
        ] },            
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
        this.addRoute("/users/:username/:project/morldmaker", "GET", this.getHome, helper.project_edit_perm);
        this.addRoute("/users/:username/:project/morldmaker/getWorld", "GET", this.getWorld, helper.project_edit_perm);
        this.addRoute("/users/:username/:project/morldmaker/postWorld", "POST", this.postWorld, helper.project_edit_perm);
	},


    find_world_file : function(project, callback) {
        resource_ctrl.find_world_file(project, function(err, file) {
            if (err) {
                callback(err);
                return ;
            } else if (!file) {
                callback('No world.js file for project ' + req.params.project);
                return ;
            }
            callback(err, file);
        });
    },

    getHome : function(req, res) {
        res.render("worldmaker.ejs");
    },    

    getWorld : function(req, res) {
        this.find_world_file(req.params.project, function(err, file) {
            if (err) {
                helper.internal_server_error(res, err);
                return ;
            }
            fs.readFile('./' + file.path, 'utf8', function(err, data) {
                if (err) {
                    console.log('readfile error', err);
                    helper.internal_server_error(res, err);
                    return ;
                }
                res.json(JSON.parse(data));
                //console.log(data);
                //res.json(eval(data));
            });
        });
    },

    postWorld : function(req, res) {

        var world = req.body;
        this.parse(world);
        this.find_world_file(req.params.project, function(err, file){
           if (err) {
                helper.internal_server_error(res, err);
                return ;
            }
            fs.writeFile('./' + file.path, JSON.stringify(world) , 'utf8', function(err) {
                if (err) {
                    console.log('writefile error', err);
                    helper.internal_server_error(res, err);
                    return ;
                }
                res.send('success');
            }); 
        });
    },

    isNumber : function(s) {

        for (var i in s)
            if ((s[i] < '0' || s[i] > '9') && s[i] != '.' && s[i] != '-')
                return (false);
        return (true);
    },

    parse : function(obj) {

        for (var i in obj) {
            if (_.isObject(obj[i]) || _.isArray(obj[i]))
                this.parse(obj[i]);
            else if (this.isNumber(obj[i]))
                obj[i] = parseFloat(obj[i]);
        }
    },
});

module.exports = function(app) {

	return (new Controller(app));
}