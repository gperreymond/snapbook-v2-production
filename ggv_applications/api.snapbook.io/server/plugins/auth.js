"use strict";

var AuthJWT = require('hapi-auth-jwt2');

var AuthProvision = function(server, callback) {

  server.register([ {register: AuthJWT} ], function (err) {
    
    if (err) return server.logger.fatal('auth provision', err);
    server.logger.info('auth registered provision');

    server.auth.strategy('jwt', 'jwt', {
      key: process.env.SNAPBOOK_JWT_KEY_SESSION,
      validateFunc: require('./libs/auth_jwt_validate.js'),
      verifyOptions: { algorithms: [ 'HS256' ] },
    });
    
    callback();
    
  });

};

module.exports = AuthProvision;