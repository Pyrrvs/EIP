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
                                ['user_id', 'name'],
                                [new_proj.user_id, new_proj.name])
                        .execute(function(err, result) {
                            callback(err, result);
                        });
    }
});