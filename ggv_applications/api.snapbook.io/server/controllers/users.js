"use strict";

var Boom = require('boom');
var Joi = require('joi');
var _ = require('lodash');
var jwt = require('jsonwebtoken');

var Users = require('.././models/user');

exports.me = {
  auth: {
    strategy: 'jwt',
    scope: ['user','superu']
  },
  tags: ['api', 'auth'],
  description: 'Retourne l\'utilisateur actuellement authentifié.',
  notes: 'Retourne l\'utilisateur actuellement authentifié.',
  jsonp: 'callback',
  handler: function(request, reply) {
    Users.findOne({ _id : request.auth.credentials._id },function(err, user) {
      if (err) return reply(Boom.badRequest(err));
      if (_.isNull(user)) return reply(Boom.badRequest('User not found'));
  		reply(user);
    });
  }
};

exports.local = {
  auth: false,
  tags: ['api', 'auth'],
  description: 'Authentification sur snapbook.',
  notes: 'Authentification sur snapbook.',
  payload: {
    allow: 'application/x-www-form-urlencoded',
  },
  validate: {
    payload: {
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }
  },
  jsonp: 'callback',
  handler: function(request, reply) {
  	Users.findOne({ email : request.payload.email }, function(err, user) {
      if (err) return reply(Boom.badRequest(err));
      if (_.isNull(user)) return reply(Boom.badRequest('User not found'));
      if (user.authenticate(request.payload.password)) {
  	    var signToken = jwt.sign({ _id: user._id, scope: user.scope }, process.env.SNAPBOOK_JWT_KEY_SESSION, { expiresIn: 60*60*24 });
  		  reply({token: signToken});
      } else {
        reply(Boom.unauthorized('User not authenticate'));
      }
  	});
  }
};