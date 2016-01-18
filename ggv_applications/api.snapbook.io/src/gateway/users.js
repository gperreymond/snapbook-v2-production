"use strict";

var Boom = require('boom');
var Joi = require('joi');
var _ = require('lodash');
var jwt = require('jsonwebtoken');

var Users = require('.././models/user');

/**********************
 * MONGODB
 ***/

exports.me = {
  auth: {
    strategy: 'jwt',
    scope: ['user','superu']
  },
  tags: ['api'],
  description: 'Obtenir les détails de l\'utilisateur actuellement authentifié',
  notes: 'Obtenir les détails de l\'utilisateur actuellement authentifié',
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
  tags: ['api'],
  description: 'Effectuer une authentification sur snapbook',
  notes: 'Effectuer une authentification sur snapbook',
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

/**********************
 * RETHINKDB
 ***/

exports.thinky_create = {
  auth: {
    strategy: 'jwt',
    scope: ['superu']
  },
  tags: ['api'],
  description: 'Ajouter un utilisateur sur snapbook',
  notes: 'Ajouter un utilisateur sur snapbook',
  payload: {
    allow: 'application/x-www-form-urlencoded',
  },
  validate: {
    payload: {
      email: Joi.string().required().email(),
      password1: Joi.string().required(),
      password2: Joi.string().required(),
      scope: Joi.string().required()
    }
  },
  jsonp: 'callback',
  handler: function(request, reply) {
    // password confirmation
    if (request.payload.password1!==request.payload.password2) return reply(Boom.badRequest('invalid password confimation'));
    request.payload.password = request.payload.password1;
    delete request.payload.password1;
    delete request.payload.password2;
    // execute create user command
    request.server.domain.CreateUserCommand(request.payload, function(err, user) {
      if (err) {
        request.server.logger.error(err);
        return reply(Boom.badRequest(err));
      }
      reply(user);
    });
  }
};