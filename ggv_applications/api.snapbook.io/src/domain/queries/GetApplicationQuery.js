"use strict";

var CURRENT_ACTION = 'Query';
var CURRENT_NAME = 'GetApplicationQuery';

module.exports = function(id, callback) {
  
  var self = this;
  
  try {
    
    self.logger.debug(CURRENT_ACTION, CURRENT_NAME, 'execute');
    
    self.ApplicationModel.get(id).run().then(function(result) {
      callback(null, result);
    });
    
  } catch (e) {
    callback(e, null);
  }

};