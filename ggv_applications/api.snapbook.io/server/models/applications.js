// Load modules

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var dir = require('node-dir');
var md5 = require('md5-file');
var fs = require("fs");
var fse = require('fs-extra');
var path = require("path");
var async = require("async");
var uuid = require('uuid');
var _ = require('lodash');

var ErrorEvent = require("./../event/error.event"); // CUSTOM ERROR EVENT

// Declare internals

var internals = {};

////////////////////////
// @constructor
////////////////////////

exports = module.exports = internals.Applications = function(server) {
	var self = this;
	
	// add schema to server' methods
	server.method('ApplicationSchema', function() {
		
		var ApplicationSchema = new Schema({
			// fields
			name: { type: String, required: true, trim: true, default: '' }, 
			cover: { type: String, trim: true, default: '' },
			description: { type: String, trim: true, default: '' },
			createdAt: { type: Date, default: Date.now },
			modifiedAt: { type: Date, default: Date.now },
			// relationships
			auth: { type: Schema.Types.ObjectId, ref: 'Users' },
			patterns: [{ type: Schema.Types.ObjectId, ref: 'Patterns' }],
			ressources: [{ type: Schema.Types.ObjectId, ref: 'Ressources' }],
			activities: [{ type: Schema.Types.ObjectId, ref: 'Activities' }]
		});
		
		ApplicationSchema.set('versionKey', false);
		
		return ApplicationSchema;
		
	});
	
	self.cv = require('ggv-opencv');
	
	// --- crud (list all)
	server.route({
	    method: 'GET',
	    path: '/applications',
	    handler: function(request,reply) {
	        self.list_Handler(request,reply);
	    },
	    config: {
            auth: {
                strategy: 'token',
                scope: ['superu']
            }
        }
	});
	
	// --- crud (create)
	server.route({
	    method: 'POST',
	    path: '/applications',
	    handler: function(request,reply) {
	        self.create_Handler(request,reply);
	    },
	    config: {
            auth: {
                strategy: 'token',
                scope: ['superu']
            }
        }
	});
	
	// --- crud (read)
	server.route({
	    method: 'GET',
	    path: '/applications/{id}',
	    handler: function(request,reply) {
	        self.read_Handler(request,reply);
	    },
	    config: {
            auth: {
                strategy: 'token',
                scope: ['application','user','superu']
            }
        }
	});

	// --- crud (compare)
	server.route({
	    method: 'POST',
	    path: '/applications/{id}/compare',
	    handler: function (request, reply) {
        	self.compare_Handler(request, reply);
		},
	    config: {
	        payload: {
	        	maxBytes: 5242880,
	            output: 'stream',
	            parse: true,
	            allow: 'multipart/form-data'
	        },
	        auth: {
                strategy: 'token',
                scope: ['application','superu']
            }
	        
	    }
	});
	
};

////////////////////////
// @crud
////////////////////////



internals.Applications.prototype.create_Handler = function(request, reply) {
	var errorEvent;
	var Users = mongoose.model('Users');
	var Applications = mongoose.model('Applications');
	
	async.waterfall([
		
		/////////////////////////////////////////
		// create application
		/////////////////////////////////////////
		
		function(callback) {
			var results = {};
			new Applications(request.payload).save(function(err,application) {
				if (err) {
					errorEvent = new ErrorEvent(418,'ERROR_TYPE_APPLICATIONS_CREATE',err);
					callback(errorEvent,results);
					return;
				}
				results.application = application;
				callback(null,results);
			});
		},
		
		/////////////////////////////////////////
		// create user
		/////////////////////////////////////////
		
		function(results,callback) {
			var auth = {};
			auth.name = uuid.v4();
			auth.email = auth.name+"@snapbook.io";
			auth.password = auth.name;
			auth.scope = "application";
			new Users(auth).save(function(err,user) {
				if (err) {
					errorEvent = new ErrorEvent(418,'ERROR_TYPE_APPLICATIONS_CREATE',err);
					callback(errorEvent,results);
					return;
				}
				results.user = user;
				callback(null,results);
			});
		},
		
		/////////////////////////////////////////
		// affect user to application
		/////////////////////////////////////////
		
		function(results,callback) {
			results.application.auth = results.user._id;
			results.application.save(function(err,application) {
				if (err) {
					errorEvent = new ErrorEvent(418,'ERROR_TYPE_APPLICATIONS_CREATE',err);
					callback(errorEvent,results);
					return;
				}
				callback(null,application);
			});
		},
		
	], function(err, results) {
		if (err) {
			err.dispatch(reply);
	    } else {
	    	reply(results);
	    }
	});
};

internals.Applications.prototype.list_Handler = function(request, reply) {
	var Applications = mongoose.model('Applications');
	
	Applications
	.find()
	.sort('-modifiedAt')
	.exec(function(err, applications) {
		if (err) {
			var errorEvent = new ErrorEvent(418,'ERROR_TYPE_APPLICATIONS_LIST',err);
			errorEvent.dispatch(reply);
		} else {
			reply(applications);
		}
	});
};

internals.Applications.prototype.read_Handler = function(request, reply) {
	var Applications = mongoose.model('Applications');
	
	Applications
	.findOne({_id: request.params.id})
	.populate('auth patterns ressources activities')
	.exec(function(err, application) {
		if (err) {
			var errorEvent = new ErrorEvent(418,'ERROR_TYPE_APPLICATIONS_READ',err);
			errorEvent.dispatch(reply);
		} else {
			reply(application);
		}
	});
};