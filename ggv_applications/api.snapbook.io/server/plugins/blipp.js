"use strict";

var Blipp = require('blipp');

var options = {
  showAuth: false,
  showStart: false
};

var BlippProvision = function(server, callback) {
  server.register({
    register: Blipp,
    options: options
  }, function (err) {
    
    if (err) return server.logger.fatal('blipp provision', err);
    server.logger.info('blipp registered provision');
    
    callback();
    
  });
};

module.exports = BlippProvision;