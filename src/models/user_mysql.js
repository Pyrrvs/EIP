var kNode = require('../../util/kNode.js')

module.exports = kNode.Model.extend({

    db : null,

    ctor : function() {

        this.super();
        this.db = require('./model_mysql.js');
    },

    findByName : function(username, callback) {

        this.db.query().select('*')
                        .from('users')
                        .where('username=?', [username])
                        .limit(1)
                        .execute(function(err, rows, cols) {
                            callback(err, rows[0]);
                        });
        console.log('end');
    },

    findById : function(id, callback) {
        this.db.query().select('*')
                        .from('users')
                        .where('id=?', [id])
                        .limit(1)
                        .execute(function(err, rows, cols) {
                            callback(err, rows[0]);
                        });
    },

    create : function(new_user, callback) {
        console.log('Creating new user', new_user);
        this.db.query().insert('users',
                                ['username', 'password', 'email', 'home'],
                                [new_user.username, new_user.password, new_user.email, new_user.home])
                        .execute(function(err, result) {
                            callback(err, result);
                        });
    }

});