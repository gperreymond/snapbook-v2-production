"use strict";

var _ = require('lodash');

// enable cloud9 configuration file.
if (process.env.ENABLE_CLOUD9) {
  var jsonfile = require('jsonfile');
  _.merge(process.env, jsonfile.readFileSync('cloud9.json'));
}

// enable newrelic
if (process.env.ENABLE_NEWRELIC) require('newrelic');

// configure database
var mongoose = require("mongoose");
mongoose.connect(process.env.SNAPBOOK_MONGO_URI);

// declare all services
var Services = require('./services');

// get instances
var server = Services.server();
var domain = Services.domain();
var io = Services.io();

// start the server
Services.start_server(function(err) {
  if (err) return server.logger.fatal(err);
  Services.start_io();
  server.logger.info('server started ', server.info.uri);
  server.logger.info('--------------------------------------------------------------');
  server.logger.info('BLIPP RESULTS');
  server.logger.info('--------------------------------------------------------------');
  _.forEach(server.plugins.blipp.text().split('\n'), function(item) {
    if (item!=='') server.logger.info(item.trim());
  });
  server.logger.info('--------------------------------------------------------------');
  // initialize the domain
  domain.logger = server.logger;
  domain.io = io;
  // start domain listeners
  // affect domain to server
  server.domain = domain;
});