var kNode = require('../../util/kNode.js');
var fs = require('fs');

var Controller = kNode.Controller.extend({

	ctor : function(app) {

		this.super(app, null);
        this.proj_contrl = new (require('./project.js'))(app);
        this.addRoute("/users/:username/:project/WorldMaker", "GET", this.getHome, helper.project_edit_perm);
        this.addRoute("/users/:username/:project/WorldMaker/getWorld", "GET", this.getWorld, helper.project_edit_perm);
        this.addRoute("/users/:username/:project/WorldMaker/putWorld", "PUT", this.putWorld, helper.project_edit_perm);

 //        this.addRoute("/users/:username/:project/WorldMaker", "GET", this.getHome);
 //        this.addRoute("/users/:username/:project/WorldMaker/getWorld", "GET", this.getWorld);
 //        this.addRoute("/users/:username/:project/WorldMaker/putWorld", "PUT", this.putWorld);        
	},


    getHome : function(req, res) {
        res.render("kWM.ejs");
    },    

    getWorld : function(req, res) {
        resource_ctrl.find_world_file(req.params.project, function(err, file) {
            if (err) {
                console.log('get resource err', err);
                helper.internal_server_error(res, err);
                return ;
            } else if (!file) {
                console.log('No world.js file for project ' + req.params.project);
                helper.internal_server_error(res, 'No world.js file for project ' + req.params.project);
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

    putWorld : function(req, res) {

        
        this.world = JSON.parse(req.data);
    },
});

module.exports = function(app) {

	return (new Controller(app));
}