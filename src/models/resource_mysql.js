var kNode = require('../../util/kNode.js')

module.exports = kNode.Model.extend({

    db : null,

    ctor : function() {
        this.super();
        this.db = require('./model_mysql.js');
    },

    create : function(new_resource, callback) {
        console.log('Creating resource', new_resource);
        this.db.query().insert('resources',
                                ['project_id', 'name', 'path', 'type'],
                                [new_resource.project_id, new_resource.name, new_resource.path, new_resource.type])
                        .execute(function(err, result) {
                            callback(err, result);
                        });
    },

    find_by_project_and_type : function(project, type, callback) {
        this.db.query('SELECT resources.* FROM resources JOIN projects ON resources.project_id = projects.id')
                    .where('(projects.name=? AND resources.type=?)', [project, type])
                        .execute(function(err, rows, cols) {
                            callback(err, rows);
                        });
    },

    find_world_file : function(project, callback) {
        this.db.query('SELECT resources.* FROM resources JOIN projects ON resources.project_id = projects.id')
                    .where('(projects.name=? AND resources.type=?)', [project, 'kworldmaker'])
                        .execute(function(err, rows, cols) {
                            callback(err, rows ? rows[0] : rows);
                        });        
    }
});