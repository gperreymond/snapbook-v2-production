"use strict";

var Bcrypt = require('bcrypt');

module.exports = function(thinky) {
  
  var type = thinky.type;
  
  var UserModel = thinky.createModel("users", {
    // fields
    email: type.string().email().required(),
    password: type.string().required(),
    scope: type.string().required(),
    // calculated
    salt: type.string(),
    // automatic
    createdAt: type.date().required(),
    modifiedAt: type.date().required()
  }); 
  
  UserModel.pre('save', function(next) {
    var user = this;
    // salt exists ?
    if (user.salt) return next();
    // generate a salt
    Bcrypt.genSalt(10, function(err, salt) {
      if (err) return next(err);
      user.salt = salt;
      // hash the password along with our new salt
      Bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);
        // override the cleartext password with the hashed one
        user.password = hash;
        next();
      });
    });
  });
  
  return UserModel;
  
};