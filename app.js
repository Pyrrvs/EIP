var ejs = require('ejs');
var crypto = require('crypto');
var express = require('express');
var http = require('http');
var app = express();

app.set('views', __dirname + '/src/views');
app.set('view engine', 'ejs');
app.use(express.bodyParser());
app.use(express.cookieParser('tototiti'));
app.use(express.session());
app.use(express.static(__dirname + '/public'));

function hash(pwd, salt, fn) {
	var len = 128;
	var iterations = 12000;

	if (3 == arguments.length) {
    	crypto.pbkdf2(pwd, salt, iterations, len, fn);
    }
    else {
    	fn = salt;
    	crypto.randomBytes(len, function(err, salt)	{
      		if (err)
      			return fn(err);
      		salt = salt.toString('base64');
      		crypto.pbkdf2(pwd, salt, iterations, len, function(err, hash) {
        		if (err)
        			return fn(err);
        		fn(null, salt, hash);
      		});
    	});
  	}
};

var users = {
  tj: { name: 'tj' }
};

// when you create a user, generate a salt
// and hash the password ('foobar' is the pass here)

hash('foobar', function(err, salt, hash){
  if (err) throw err;
  // store the salt & hash in the "db"
  users.tj.salt = salt;
  users.tj.hash = hash;
});

// Authenticate using our plain-object database of doom!

function authenticate(name, pass, fn) {
  if (!module.parent)
  	console.log('authenticating %s:%s', name, pass);
  var user = users[name];
  if (!user)
  	return fn(new Error('cannot find user'));
  hash(pass, user.salt, function(err, hash) {
    if (err) 
    	return fn(err);
    if (hash == user.hash)
    	return fn(null, user);
    fn(new Error('invalid password'));
  })
}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

app.get('/', function(req, res) {
	res.render('index');
});

app.get('/restricted', restrict, function(req, res) {
  res.send('Wahoo! restricted area, click to <a href="/logout">logout</a>');
});

app.get('/logout', function(req, res) {
	req.session.destroy(function() {
    	res.redirect('/');
	});
});

app.get('/login', function(req, res) {
 	res.render('index');
});

app.post('/login', function(req, res) {
  authenticate(req.body.username, req.body.password, function(err, user) {
    if (user) {
    	req.session.regenerate(function() {
        req.session.user = user;
        req.session.success = 'Authenticated as ' + user.name
          + ' click to <a href="/logout">logout</a>. '
          + ' You may now access <a href="/restricted">/restricted</a>.';
        res.redirect('back');
      });
    } else {
      req.session.error = 'Authentication failed, please check your '
        + ' username and password.'
        + ' (use "tj" and "foobar")';
      res.redirect('login');
    }
  });
});

http.createServer(app).listen(8888);