"use strict";

var CURRENT_ACTION = 'Command';
var CURRENT_NAME = 'ValidateDataCommand';

module.exports = function(data, callback) {

  var self = this;
  
  try {
    
    self.logger.debug(CURRENT_ACTION, CURRENT_NAME, 'execute');
  
    try {
      data.validate();
      callback(null, true);
    } catch(err) {
      callback(err, null);
    }
  
  } catch (e) {
    callback(e, null);
  }
  
};