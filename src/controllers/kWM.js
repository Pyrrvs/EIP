var kNode = require('../../util/kNode.js');
var fs = require('fs');

var Controller = kNode.Controller.extend({
    
	ctor : function(app) {

		this.super(app, null);
        this.proj_contrl = new (require('./project.js'))(app);
        this.addRoute("/users/:username/:project/worldmaker", "GET", this.getHome, helper.project_edit_perm);
        this.addRoute("/users/:username/:project/worldmaker/getWorld", "GET", this.getWorld, helper.project_edit_perm);
        this.addRoute("/users/:username/:project/worldmaker/postWorld", "POST", this.postWorld, helper.project_edit_perm);
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