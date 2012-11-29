var kNode = require('../../util/kNode.js')

module.exports = kNode.Model.extend({

    db : null,

    ctor : function() {

        this.super();
        this.db = require('./model_mysql.js');
    },

    find_by_name : function(username, callback) {

        this.db.query().select('*')
                        .from('users')
                        .where('username=?', [username])
                        .limit(1)
                        .execute(function(err, rows, cols) {
                            callback(err, (err ? rows : rows[0]));
                        });
    },

    find_by_id : function(id, callback) {
        this.db.query().select('*')
                        .from('users')
                        .where('id=?', [id])
                        .limit(1)
                        .execute(function(err, rows, cols) {
                            callback(err, (err ? rows : rows[0]));
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