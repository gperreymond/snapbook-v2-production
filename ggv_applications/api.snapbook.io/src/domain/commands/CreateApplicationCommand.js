"use strict";

var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var CURRENT_ACTION = 'Command';
var CURRENT_NAME = 'CreateApplicationCommand';

module.exports = function(data, callback) {
  
  var self = this;
  
  try {
    
    self.logger.debug(CURRENT_ACTION, CURRENT_NAME, 'execute');
    
    data.id = new ObjectId().toString();
    data.createdAt = Date.now();
    data.modifiedAt = data.createdAt;
    var application = new self.ApplicationModel(data);
    
    self.CreateApplicationAuthentificationCommand(application)
    .then(function(result) {
      self.ValidateDataCommand(application)
      .then(function(result) {
        self.SaveDataCommand(application)
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