/* user schema */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Schema = mongoose.Schema;



/****** The user schema attributes  / characteristics / fields ******/
var UserSchema = new Schema({
  email: {type: String, unique: true, lowercase: true},  // rule of email
  password: String,

  profile: {
    name: {type: String, default: ''},
    picture: {type: String, default: ''},
  },

  address: String,
  history: [{                 // user purchase history
    date: Date,
    paid: {type: Number, default: 0},
    // item: {type: Schema.Types.Object, ref: ''}
  }]
});



/****** Hash the password before we even save it to the database ******/
UserSchema.pre('save', function(next) {
  var user = this;       // 'this' refers to the current object of UserSchema
  if(!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    if(err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if(err) {
        return next(err);
      }
      user.password = hash;     // hash will be the number likes 123sffe
      next();
    });
  });
});



/****** user-defind method, need to use methods ******/
// Compare password in the database and the one user type in
UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}

// Return a unique picuture to a user
UserSchema.methods.gravatar = function(size) {
  if (!this.size) size = 200;
  if (!this.email) return 'https://gravatar.com/avatar/?s' + size + '&d=retro';
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
}




module.exports = mongoose.model('User', UserSchema);
