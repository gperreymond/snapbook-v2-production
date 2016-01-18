"use strict";

var CURRENT_ACTION = 'Query';
var CURRENT_NAME = 'FindUsersQuery';

module.exports = function(filter, callback) {
  
  var self = this;
  
  try {
    
    self.logger.debug(CURRENT_ACTION, CURRENT_NAME, 'execute');
    
    self.UserModel.filter(filter).run().then(function(results) {
      callback(null, results);
    });
    
  } catch (e) {
    callback(e, null);
  }

};