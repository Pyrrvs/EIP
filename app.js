_ = require("./util/underscore.js")
var ejs = require('ejs');
var crypto = require('crypto');
var express = require('express');
var http = require('http');
var flash = require('connect-flash');
var passport = require('passport');
var app = express();

app.configure(function() {
	app.set('views', __dirname + '/src/views');
	app.set('view engine', 'ejs');
	app.use(express.bodyParser());
	app.use(express.cookieParser('tototiti'));
	app.use(express.session());
	app.use(express.static(__dirname + '/public'));
	app.use(flash());
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
});

app.param(function(name, fn){
  if (fn instanceof RegExp) {
    return function(req, res, next, val){
      var captures;
      if (captures = fn.exec(String(val))) {
        req.params[name] = captures;
        next();
      } else {
        next('route');
      }
    }
  }
});

require('./src/controllers/project.js')(app);
require('./src/controllers/user.js')(app);
require('./src/controllers/index.js')(app);

http.createServer(app).listen(8888);
