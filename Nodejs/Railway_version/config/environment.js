var express = require('express');
var rwps = require('railway-passport');
var flash = require('connect-flash');

app.configure(function(){
    var cwd = process.cwd();
    

    app.use(express.static(cwd + '/public', {maxAge: 86400000}));
    app.set('view engine', 'ejs');
    app.set('view options', {complexNames: true});
    app.set('jsDirectory', '/javascripts/');
    app.set('cssDirectory', '/stylesheets/');
    app.use(express.bodyParser());
    app.use(express.cookieParser('ultrasecret'));
    app.use(express.session({secret: 'ultrasecret'}));
    app.use(express.methodOverride());
    app.use(flash());
    rwps.init();
    app.use(app.router);
});

