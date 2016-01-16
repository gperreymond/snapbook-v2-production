"use strict";

var HapiSwagger = require('hapi-swaggered');

var pkginfo = require('resolve-app-pkginfo');
var pkg = pkginfo.sync();

// swagger
var options = {
  supportedMethods: ['get', 'post', 'delete', 'patch'],
  info: {
    version: pkg.version,
    title: pkg.name,
    description: pkg.description
  },
  cors: true
};
  
// swaggerui
var optionsui = {
  title: 'API GATEWAY',
  path: '/docs',
  authorization: {
    field: 'Authorization',
    scope: 'header',
    placeholder: 'Saisir votre token ici...'
  }
};

var SwaggerProvision = function(server, callback) {
  // route
  server.route({
    path: '/',
    method: 'GET',
    handler: function (request, reply) {
      reply.redirect('/docs');
    }
  });
  // register Swagger
  server.register([
    require('inert'),
    require('vision'),
    {
      register: HapiSwagger,
      options: options
    }], function (err) {
      
  	  if (err) return server.logger.fatal('swagger provision', err);
      server.logger.info('swagger registered provision');
    
    // register Swagger UI
    server.register([
    {
      register: require('hapi-swaggered-ui'),
      options: optionsui
    }], function (err) {
      
    	if (err) return server.logger.fatal('swagger-ui provision', err);
      server.logger.info('swagger-ui registered provision');
      
      callback();
    });
  });
};

module.exports = SwaggerProvision;