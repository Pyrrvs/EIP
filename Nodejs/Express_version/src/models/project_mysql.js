var kNode = require('../../util/kNode.js')

module.exports = kNode.Model.extend({

    db : null,

    ctor : function() {

        this.super();
        this.db = require('./model_mysql.js');
    },

    create : function(new_proj, callback) {
        console.log('Creating new project', new_proj);
        this.db.query().insert('projects',
                                ['owner_id', 'name', 'privacy'],
                                [new_proj.owner_id, new_proj.name, new_proj.privacy])
                        .execute(function(err, result) {
                            callback(err, result);
                        });
    },

    find_by_owner : function(owner, callback, privacy) {
        if (arguments.length == 3) {
            this.db.query('SELECT projects.* FROM projects JOIN users ON projects.owner_id = users.id WHERE (username=? AND privacy=?)', [owner, privacy])
                .execute(function(err, rows, cols) {
                    callback(err, rows);
            });
        } else {
            this.db.query('SELECT projects.* FROM projects JOIN users ON projects.owner_id = users.id WHERE username=?', [owner])
                .execute(function(err, rows, cols) {
                    callback(err, rows);
            });
        }
    },

    find_by_name_and_owner : function(project_name, owner, callback) {
        this.db.query('SELECT projects.* FROM projects JOIN users ON projects.owner_id = users.id')
                    .where('(users.username=? AND projects.name=?)', [owner, project_name])
                        .execute(function(err, rows, cols) {
                            callback(err, (rows ? rows[0] : rows));
                        });
    }
});
