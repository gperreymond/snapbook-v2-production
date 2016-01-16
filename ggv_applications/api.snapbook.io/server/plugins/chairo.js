"use strict";

var Chairo = require('chairo');
var SenecaOpenCV = require('./seneca/opencv');

var options = {
  log: 'debug',
  actcache: {
    active: true
  },
  default_plugins: {
    web: false
  }
};

var ChairoProvision = function(server, callback) {
  server.register({
    register: Chairo,
    options: options
  }, function (err) {

    if (err) return server.logger.fatal('chairo provision', err);
    server.logger.info('chairo registered provision');
    
    server.seneca.add( {role: 'opencv', cmd: 'analyse'}, SenecaOpenCV.analyse );
    server.seneca.add( {role: 'opencv', cmd: 'compute'}, SenecaOpenCV.compute );
    server.seneca.add( {role: 'opencv', cmd: 'compare'}, SenecaOpenCV.compare );
    
    callback();
    
  });
};

module.exports = ChairoProvision;