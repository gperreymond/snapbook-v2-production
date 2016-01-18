"use strict";

var Boom = require('boom');
var Joi = require('joi');
var async = require('async');
var _ = require('lodash');
var uuid = require('uuid');
var fse = require('fs-extra');
var path = require('path');
var fs = require('fs');
var dir = require('node-dir');

var Application = require('../models/application');
var Ressource = require('../models/ressource');

exports.create = {
  auth: {
    strategy: 'jwt',
    scope: ['superu']
  },
  tags: ['api'],
  description: 'Ajouter une ressource pour pour une application',
  notes: 'Ajouter une ressource pour pour une application',
  validate: {
    payload: {
      application: Joi.string().required()
    },
    params: {
    }
  },
  payload: {
    allow: 'application/x-www-form-urlencoded',
  },
  jsonp: 'callback',
  handler: function(request, reply) {
    async.waterfall([
  		/////////////////////////////////////////
  		// check if application exists ?
  		/////////////////////////////////////////
  		function(callback) {
  			var results = {not_yet:true};
  			callback(null, results);
  		},
  		/////////////////////////////////////////
  		// create ressource
  		/////////////////////////////////////////
  		function(results,callback) {
  			callback(null, results);
  		}
  	], function(err, results) {
  		reply(Boom.unauthorized('Not implemented yet'));
  	});
  }
};

exports.update = {
  auth: {
    strategy: 'jwt',
    scope: ['superu']
  },
  tags: ['api'],
  description: 'Modifier une ressource pour pour une application',
  notes: 'Modifier une ressource pour pour une application',
  validate: {
    payload: {
      
    },
    params: {
      id: Joi.string().required()
    }
  },
  payload: {
    allow: 'application/x-www-form-urlencoded',
  },
  jsonp: 'callback',
  handler: function(request, reply) {
    async.waterfall([
  		/////////////////////////////////////////
  		// check if application exists ?
  		/////////////////////////////////////////
  		function(callback) {
  			var results = {not_yet:true};
  			callback(null, results);
  		},
  		/////////////////////////////////////////
  		// create ressource
  		/////////////////////////////////////////
  		function(results,callback) {
  			callback(null, results);
  		}
  	], function(err, results) {
  		reply(Boom.unauthorized('Not implemented yet'));
  	});
  }
};