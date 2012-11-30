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
    this.post_user = _.bind(this.post_user, this);

		passport.use(new LocalStrategy(this.authenticate_middleware));
		passport.serializeUser(this.serialize_user);
		passport.deserializeUser(this.deserialize_user);

		this.addRoute('/sign_in', 'POST', function(req, res) {
      res.redirect('/users/' + req.user.username);
    }, passport.authenticate('local', {
      failureRedirect: '/',
      failureFlash: true 
    }));

		this.addRoute('/sign_up', 'POST', this.register_user);

    app.param('username', /^\w+$/);
    this.addRoute('/users/:username', 'GET', this.get_profile);
	},

  find_by_name : function(username, callback) {
    this.model.find_by_name(username, callback);
  },




  get_profile : function(req, res) {
    var is_owner = false;
    if (req.user && req.user.username == req.params.username) {
      is_owner = true;
    }
    this.model.find_by_name(req.params.username, function(err, result) {
      if (err) {
        helper.internal_server_error(res, err);
        return ;
      } else if (!result) {
        helper.no_such_user(res, req.params.username);
        return ;
      }
      project_ctrl.find_by_owner(req.params.username, req.user ? req.user.username : null, function(err, results) {
        if (err) {
          helper.internal_server_error(res, err);
          return ;
        }
        res.render('user.ejs', {
          user : helper.create_user_obj(req.user),
          username : result.username,
          email : result.email,
          home : result.home,
          is_owner : is_owner,
          projects : results
        });
      });
    });
  },

  post_user : function(req, res) {

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
          helper.internal_server_error(res, err);
          return ;
        } else {
          new_user.id = result.id;
          fs.mkdir('./users/' + new_user.username, 0755, function(err) {
            if (err) {
              console.log('User directory creation error', err);
              helper.internal_server_error(res, err);
            }
          });
          req.login(new_user, function(err) {
            if (err) {
              helper.internal_server_error(res, err);
              return ;
            }
            return res.redirect('/users/' + req.user.username);
          });
        }
      });
    }
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

});

module.exports = function(app) {

	return (new Controller(app));
}