var router = require('express').Router();
var User = require('../models/user');
var passport = require('passport');
var passportConf = require('../config/passport');



router.get('/login', function(req, res) {
  if (req.user) {
    return res.redirect('/');
  } else {
    return res.render('accounts/login', { message: req.flash('loginMessage')});
  }
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',     // if user successfully login, go to profile
  failureRedirect: '/login',       // if user does not exist or password is wrong, go to profile
  failureFlash: true               // enable the req.flash
}));

router.get('/signup', function(req, res) {
  return res.render('accounts/signup', { errors: req.flash('errors')});
});

router.post('/signup', function(req, res, next) {
  var user = new User();

  user.profile.name = req.body.name;         // body means body-parser
  user.password = req.body.password;
  user.email = req.body.email;
  user.profile.picture = user.gravatar();    // save user's picture

  User.findOne({email: req.body.email}, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', 'Account with this email address already exists');
      return res.redirect('/signup');
    } else {
      user.save(function(err, user){
        if (err) {
          return next(err);
        }

        // req.logIn() will add the session to the server and cookie to the browser
        req.logIn(user, function(err) {
          if (err) {
            return next(err);
          } else {
            res.redirect('/profile');
          }
        });
      });
    }
  });
});

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

router.get('/profile', function(req, res, next) {
  // check whether current user id is valid
  User.findOne({ _id: req.user._id }, function(err, user) {
    if (err) {
      return next(err);
    } else {
      return res.render('accounts/profile', { user: user });  // pass user to the profile page
    }
  });
});

router.get('/edit-profile', function(req, res, next) {
  res.render('accounts/edit-profile', { message: req.flash('success')});
});

router.post('/edit-profile', function(req, res, next) {
  User.findOne({ _id: req.user._id }, function(err, user) {
    if (err) return next(err);

    if (req.body.name) user.profile.name = req.body.name;
    if (req.body.address) user.address = req.body.address;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', 'Successfully Edited your profile');
      return res.redirect('/edit-profile');
    });
  });
});


module.exports = router;
