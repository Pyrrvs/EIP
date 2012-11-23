var ejs = require('ejs');
var crypto = require('crypto');
var express = require('express');
var http = require('http');
var everyauth = require('everyauth');
var connect = require('connect');
var app = express();

app.set('views', __dirname + '/src/views');
app.set('view engine', 'ejs');
app.use(express.bodyParser());
app.use(express.cookieParser('tototiti'));
app.use(express.session());
app.use(express.static(__dirname + '/public'));

require('./src/controllers/user.js')(app);


// app.get('/', function(req, res) {
//   res.render('index');
// });

http.createServer(app).listen(8888);