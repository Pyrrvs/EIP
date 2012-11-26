var kNode = require('../../util/kNode.js')
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

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

		this.addRoute('/sign_in', 'POST',
    				passport.authenticate('local', { successRedirect: '/',
    												succesFlash: 'Welcome !',
    												failureRedirect: '/',
                                                	failureFlash: true }));
		this.addRoute('/sign_up', 'POST', this.register_user);
	},

	authenticate_middleware : function(username, password, done) {
    	this.model.findByName(username, function(err, user) {
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
    	this.model.findById(id, function(err, user) {
    		done(err, user);
  		});
    },

    register_user : function(req, res) {

    	if (req.body.password != req.body.password_confirm) {
    		console.log('Password confirmation doesn\'t match password.');
    	}
      else {
        new_user = {};
        new_user.username = req.body.username;
        new_user.password = bcrypt.hashSync(req.body.password, 8);
        new_user.email = req.body.email;
        new_user.home = '/' + new_user.username + '/';
        this.model.create(new_user, function(err, result) {
          if (err) {
            console.log('Handle registration error here !');
            res.redirect('/');
          }
          else {
            new_user.id = result.id;
            req.login(new_user, function(err) {
              if (err) {
                console.log('req.login err', err)
                return err;
              }
              return res.redirect('/');
              // return res.redirect('/users/' + req.user.username);
            });
          }
        });
      }
    }
});

module.exports = function(app) {

	return (new Controller(app));
}