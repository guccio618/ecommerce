var passport = require('passport');
// choose passport-local
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');



/*******   Serialize and Deserialize   *******/
// process of translating data structures or object's state into a format that can be stored
passport.serializeUser(function(user, next) {
  next(null, user._id);    // mongonDB will create the _id automatically
});

passport.deserializeUser(function(id, next){
  User.findById(id, function(err, user) {
    next(err, user);
  });
});



/*******   Middleware   *******/
passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, next) {
  User.findOne({email: email}, function(err, user) {
    if(err) {
      return next(err);
    }

    if(!user) {
      return next(null, false, req.flash('loginMessage', 'No user has been found'));
    }

    if(!user.comparePassword(password)) {
      return next(null, false, req.flash('loginMessage', 'Oops! Wrong Password'));
    }

    // in this step, we can use req.user._id, req.user.profile
    return next(null, user);
  });
}));



/*******   custom function to validate   *******/
exports.isAuthenticated = function(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('login');
}
