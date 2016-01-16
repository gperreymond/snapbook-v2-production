"use strict";

var bunyan = require('bunyan');

var Hapi = require('hapi');
var Routes = require('./routes');
var Sockets = require('./sockets');

var options = {
  host: process.env.SNAPBOOK_IP,
  port: process.env.SNAPBOOK_PORT,
  labels: ['api']
};

var server = new Hapi.Server({
  debug: false,
  connections: {
    routes: {
      cors: true
    }
  }
});
server.connection(options);
var io = require("socket.io")(server.listener);
var domain = require('./domain');

module.exports.start_io = function() {
  io.logger = server.logger;
  io.on("connection", Sockets.connectionHandler);
};

module.exports.start_server = function(callback) {
  server.logger = logger_console;
  if (process.env.ENABLE_PRODUCTION) server.logger = logger_file;
  server.logger.info('--------------------------------------------------------------');
  server.logger.info('HAPI BOOTSTRAP');
  server.logger.info('--------------------------------------------------------------');
  // start hapi
  var plugins = ['good', 'auth', 'swagger', 'chairo', 'blipp'];
  var async = require('async');
  async.mapSeries(plugins, function(item, callback) {
    require('./plugins/'+item)(server, function() {
      callback(null, item);
    });
  }, function(err, results) {
    if (err) return callback(err);
    server.logger.info('HAPI PLUGINS LOADED', results);
    server.route(Routes.endpoints);
    // start
    server.start(function(err) {
      callback(err);
    });
  });
};

module.exports.io = function() {
  return io;
};

module.exports.server = function() {
  return server;
};

module.exports.domain = function() {
  return domain;
};

module.exports.microservices = function() {
  return microservices;
};

// logger to console (deve mode)
var logger_console = bunyan.createLogger({
  name: "api-gateway",
  level: 'debug'
});

// logger to console (production mode)
var logger_file = bunyan.createLogger({
  name: "api-gateway",
  level: 'info',
  streams: [{
    type: "rotating-file",
    path: process.env.SNAPBOOK_LOGS_FILE,
    period: "1d",   // daily rotation
    count: 3        // keep 3 back copies
  }]
});