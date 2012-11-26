console.log('model');
var db = new (require("db-mysql")).Database({
    hostname : 'localhost',
    user : 'root',
    password : 'PAvrK7Vc',
    database : 'AGB'
});

db.connect(function(error) {
    if (error)
        console.log('Connection error: ' + error)
});

module.exports = db;