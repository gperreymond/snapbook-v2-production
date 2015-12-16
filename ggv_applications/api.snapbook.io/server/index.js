"use strict";

// enable cloud9 configuration file.
if (process.env.ENABLE_CLOUD9) {
  var _ = require('lodash');
  var jsonfile = require('jsonfile');
  _.merge(process.env, jsonfile.readFileSync('cloud9.json'));
}

// declare hapi server
var Hapi = require('hapi');
var server = new Hapi.Server({
	connections: {
  	routes: {
  		cors: true
  	}
	}
});

// configure database
var mongoose = require("mongoose");
mongoose.connect(process.env.SNAPBOOK_MONGO_URI);

// configure server
server.connection({ 
	host: process.env.SNAPBOOK_IP,
	port: process.env.SNAPBOOK_PORT
});

// configure plugin Blipp
var Blipp = require('blipp');
server.register(Blipp, function(err){
	
});

// configure plugin jwt
server.register(require('hapi-auth-jwt'), function (err) {
	if (err) console.log(err);
    server.auth.strategy('token', 'jwt', {
      key: process.env.SNAPBOOK_JWT_KEY_SESSION,
      validateFunc: validateToken
    });
});
var validateToken = function (decodedToken, callback) {
	var Users = mongoose.model('Users');
  Users
  .findOne({_id: decodedToken._id}, '-salt -hashedPassword', function(err, user) {
  	if (err) return callback(null, false);
  	return callback(null, true, user);
	});
};

// configure routes
var Routes = require('./routes');
server.route(Routes.endpoints);

// start server
server.start(function () { 
	console.log('Server running at:', server.info.uri);
});