module.exports = kNode.Model.extend({

    db : null,

    ctor : function() {

        this.super();
        this.db = new (require("db-mysql")).Database({
            hostname : 'localhost',
            user : 'root',
            password : 'PAvrK7Vc',
            database : 'AGB'
        });
        this.db.connect(function(error) {
            if (error)
                console.log('Connection error: ' + error)
        });
    },

    getUsers : function(hook) {

        this.db.query("SELECT * FROM users;").execute(hook);
    }

});