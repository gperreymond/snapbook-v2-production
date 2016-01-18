"use strict";

var uuid = require('uuid');

var CURRENT_ACTION = 'Command';
var CURRENT_NAME = 'CreateApplicationAuthentificationCommand';

module.exports = function(data, callback) {

  var self = this;
	
	try {
		
	  self.logger.debug(CURRENT_ACTION, CURRENT_NAME, 'execute');
	  
	  var prefix = uuid.v4();
	  var payload = {};
		payload.email = prefix+"@snapbook.io";
		payload.password = prefix;
		payload.scope = "application";
		self.CreateUserCommand(payload, function(err, auth) {
		  if (err) return callback(err, null);
		  data.auth = auth.id;
		  callback(null, auth);
		});
  
	} catch (e) {
    callback(e, null);
  }
  
};