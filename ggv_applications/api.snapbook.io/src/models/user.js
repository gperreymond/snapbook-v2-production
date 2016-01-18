"use strict";

var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var crypto = require('crypto');

var UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  info: { type: String, trim: true }, 
  scope: { type: String, required: true },
  hashedPassword: String,
  provider: String,
  salt: String
});
	    
UserSchema
.virtual('password')
.set(function(password) {
  this._password = password;
  this.salt = this.makeSalt();
  this.hashedPassword = this.encryptPassword(password);
})
.get(function() {
  return this._password;
});

UserSchema
.virtual('profile')
.get(function() {
  return {
    'name': this.name,
    'scope': this.scope
  };
});

UserSchema
.virtual('token')
.get(function() {
  return {
    '_id': this._id,
    'scope': this.scope
  };
});

UserSchema.methods = {
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

UserSchema.set('versionKey', false);
module.exports = Mongoose.model('User', UserSchema, 'users');


