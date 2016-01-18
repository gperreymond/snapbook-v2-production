"use strict";

var CURRENT_ACTION = 'Command';
var CURRENT_NAME = 'SaveDataCommand';

module.exports = function(data, callback) {

  var self = this;
  
  try {
    
    self.logger.debug(CURRENT_ACTION, CURRENT_NAME, 'execute');

    data.save(function(err, saved) {
      if (err) return callback(err, null);
      self.logger.debug(CURRENT_ACTION, CURRENT_NAME, 'data saved', saved);
      callback(null, saved);
    });
    
  } catch (e) {
    callback(e, null);
  }
  
};