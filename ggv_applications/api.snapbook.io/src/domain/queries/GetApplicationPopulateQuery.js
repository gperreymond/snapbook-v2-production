"use strict";

var CURRENT_ACTION = 'Query';
var CURRENT_NAME = 'GetApplicationPopulateQuery';

module.exports = function(id, callback) {
  
  var self = this;
  
  try {
    
    self.logger.debug(CURRENT_ACTION, CURRENT_NAME, 'execute');
    
    self.GetApplicationQuery(id)
    .then(function(application) {
      self.GetUserQuery(application.auth)
      .then(function(result) {
         application.auth = result;
         callback(null, application);
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