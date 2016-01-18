"use strict";

var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var CURRENT_ACTION = 'Command';
var CURRENT_NAME = 'CreateUserCommand';

module.exports = function(data, callback) {

  var self = this;
  
  try {
    
    self.logger.debug(CURRENT_ACTION, CURRENT_NAME, 'execute');
    
    data.id = new ObjectId().toString();
    data.createdAt = Date.now();
    data.modifiedAt = data.createdAt;
    var user = new self.UserModel(data);
    
    self.UserEmailAlreadyExistsQuery(user.email)
    .then(function(result) {
      self.ValidateDataCommand(user)
      .then(function(result) {
        self.SaveDataCommand(user)
        .then(function(result) {
          callback(null, result);
        })
        .catch(function(error) {
          callback(error, null);
        });
      })
      .catch(function(error) {
        callback(error, null);
      });
    })
    .catch(function(error) {
      callback(error, null);
    });

  } catch (e) {
    callback(e, null);
  }
  
};