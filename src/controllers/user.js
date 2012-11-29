var kNode = require('../../util/kNode.js');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var fs = require('fs');

var Controller = kNode.Controller.extend({

	ctor : function(app) {

		this.super(app, new (require('../models/user_mysql.js'))());
		this.authenticate_middleware = _.bind(this.authenticate_middleware, this);
		this.serialize_user = _.bind(this.serialize_user, this);
		this.deserialize_user = _.bind(this.deserialize_user, this);
    this.register_user = _.bind(this.register_user, this);

		passport.use(new LocalStrategy(this.authenticate_middleware));
		passport.serializeUser(this.serialize_user);
		passport.deserializeUser(this.deserialize_user);

		this.addRoute('/sign_in', 'POST', function(req, res) {
      res.redirect('/users/' + req.user.username + '/projects');
    }, passport.authenticate('local', {
      failureRedirect: '/',
      failureFlash: true 
    }));

		this.addRoute('/sign_up', 'POST', this.register_user);

    app.param('username', /^\w+$/);
    this.addRoute('/users/:username', 'GET', this.get_profile);
	},

  user_exists : function(username, callback) {
    this.model.find_by_name(username, function(err, result) {
      if (!err && !result) {
        callback('no such user');
        return ;
      }
      callback();
    });
  },

  get_profile : function(req, res) {
    var is_owner = (req.user.username == req.params.username);
    this.model.find_by_name(req.params.username, function(err, result) {
      if (err) {
        res.send('<h1>Error when accesing ' + req.params.username + ' profile</h1><p>' + err + '</p>');
        return ;
      } else if (!result) {
        res.send('<h1>User ' + req.params.username + ' doesn\'t exist!</h1>');
        return ;
      }
      res.render('user.ejs', {
        user : helper.create_user_obj(req.user),
        username : result.username,
        email : result.email,
        home : result.home,
        is_owner : is_owner
      });
    });
  },

	authenticate_middleware : function(username, password, done) {
    	this.model.find_by_name(username, function(err, user) {
      		if (err) {
      			return done(err);
      		}
      		if (!user) {
        		return done(null, false, { message: 'Incorrect username.' });
      		}
      		if (!bcrypt.compareSync(password, user.password)) {
        		return done(null, false, { message: 'Incorrect password.' });
      		}
      		return done(null, user);
		});
    },

    serialize_user : function(user, done) {
    	done(null, user.id);
    },

    deserialize_user : function(id, done) {
    	this.model.find_by_id(id, function(err, user) {
    		done(err, user);
  		});
    },

    register_user : function(req, res) {

    	if (req.body.password != req.body.password_confirm) {
        res.send('<h1>Password confirmation doesn\'t match password.</h1>');
    	} else {
        var new_user = {};
        new_user.username = req.body.username;
        new_user.password = bcrypt.hashSync(req.body.password, 8);
        new_user.email = req.body.email;
        new_user.home = '/users/' + new_user.username + '/';
        this.model.create(new_user, function(err, result) {
          if (err) {
            res.send('<h1>Handle registration error here !</h1><p>' + err +'</p>');
          } else {
            new_user.id = result.id;
            fs.mkdir('./users/' + new_user.username, 0755, function(err) {
              if (err) {
                console.log('User directory creation error', err);
              }
            });
            req.login(new_user, function(err) {
              if (err) {
                res.send('<h1>Handle registration error here (req.login)!</h1><p>' + err +'</p>');
                return err;
              }
              return res.redirect('/users/' + req.user.username + '/projects/new');
            });
          }
        });
      }
    }
});

module.exports = function(app) {

	return (new Controller(app));
}