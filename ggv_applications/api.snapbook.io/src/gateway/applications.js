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
var User = require('../models/user');
var Pattern = require('../models/pattern');
var Activity = require('../models/activity');
var Ressource = require('../models/ressource');

exports.create = {
  auth: {
    strategy: 'jwt',
    scope: ['superu']
  },
  jsonp: 'callback',
  handler: function(request, reply) {
    async.waterfall([
  		/////////////////////////////////////////
  		// create application
  		/////////////////////////////////////////
  		function(callback) {
  			var results = {};
  			new Application(request.payload).save(function(err,application) {
  				if (err) return reply(Boom.badRequest(err));
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
  			new User(auth).save(function(err,user) {
  				if (err) return reply(Boom.badRequest(err));
  				results.user = user;
  				callback(null,results);
  			});
  		},
  		/////////////////////////////////////////
  		// create files structure on server
  		/////////////////////////////////////////
  		function(results,callback) {
  		  try {
    		  fse.ensureDirSync(process.env.SNAPBOOK_DIR_APPLICATIONS+'/'+results.application._id+'/patterns');
    		  fse.ensureDirSync(process.env.SNAPBOOK_DIR_APPLICATIONS+'/'+results.application._id+'/ressources');
    		  fse.ensureDirSync(process.env.SNAPBOOK_DIR_APPLICATIONS+'/'+results.application._id+'/uploads');
    		  callback(null,results);
  		  } catch(e) {
  		    callback(e,null);
  		  }
  		},
  		/////////////////////////////////////////
  		// affect user to application
  		/////////////////////////////////////////
  		function(results,callback) {
  			results.application.auth = results.user._id;
  			results.application.save(function(err,application) {
  				if (err) return reply(Boom.badRequest(err));
  				callback(null,application);
  			});
  		}
  	], function(err, results) {
  		if (err) {
  			err.dispatch(reply);
  	    } else {
  	    	reply(results);
  	    }
  	});
  }
};

exports.read = {
  auth: {
    strategy: 'jwt',
    scope: ['application', 'user', 'superu']
  },
  tags: ['api'],
  description: 'Obtenir les détails d\'une application',
  notes: 'Obtenir les détails d\'une application',
  validate: {
    params: {
      id: Joi.string().required()
    }
  },
  jsonp: 'callback',
  handler: function(request, reply) {
    Application
  	.findOne({_id: request.params.id})
  	.populate('auth patterns activities ressources')
  	.exec(function(err, application) {
  		if (err) return reply(Boom.badRequest(err));
  		if (_.isNull(application)) return reply(Boom.badRequest('Application not found'));
  		reply(application);
  	});
  }
};

exports.list = {
  auth: {
    strategy: 'jwt',
    scope: ['superu']
  },
  jsonp: 'callback',
  handler: function(request, reply) {
    Application
  	.find()
  	.sort('-modifiedAt')
  	.exec(function(err, applications) {
  		if (err) return reply(Boom.badRequest(err));
  		if (_.isNull(applications)) return reply(Boom.badRequest('Applications not found'));
  		reply(applications);
  	});
  }
};

exports.compare = {
  auth: {
    strategy: 'jwt',
    scope: ['application', 'superu']
  },
  tags: ['api'],
  description: 'Obtenir le résultat d\'un compare pour une application',
  notes: 'Obtenir le résultat d\'un compare pour une application',
  validate: {
    payload: {
      file: Joi.object().meta({ swaggerType: 'file' }).required(),
      mode: Joi.string()
    },
    params: {
      id: Joi.string().required()
    }
  },
  payload: {
  	maxBytes: 5242880,
    output: 'stream',
    parse: true,
    allow: 'multipart/form-data'
  },
  jsonp: 'callback',
  handler: function(request, reply) {
    try {
      async.waterfall([
        // 0. initialize async waterfall
        function(callback) {
          var results = {};
          results.patterns = [];
          var application = path.normalize(process.env.SNAPBOOK_DIR_APPLICATIONS+'/'+request.params.id+'/patterns');
          var patterns = fse.readdirSync(application);
          async.map(patterns, function iterator(item, next) {
            var filepath = application+'/'+item;
            var extname = path.extname(filepath);
            var stat = fse.statSync(filepath);
            if (stat.isFile() && extname==='.jpg') {
              results.patterns.push(filepath);
              next(null, true);
            } else {
              next(null, false);
            }
          }, function done() {
            callback(null, results);
          });
        },
        // 1. upload file control defined
        function(results, callback) {
          // prepare
          var name = uuid.v4()+'.jpg';
          var date = new Date();
          var year = date.getUTCFullYear();
          var month = ('0' + (date.getUTCMonth()+1)).slice(-2);
          var day = ('0' + (date.getUTCDate())).slice(-2);
          var volumes_applications = process.env.SNAPBOOK_DIR_APPLICATIONS;
          var dir_path = path.normalize(volumes_applications+'/uploads/'+year+'/'+month+'/'+day); 
          fse.ensureDirSync(dir_path);
          // filecopy
          var data = request.payload;
          if (data.file) {
            var snap_filepath = path.normalize(dir_path+'/'+name);
            var file = fs.createWriteStream(snap_filepath);
            file.on('error', function (err) { 
              callback(err, null);
            });
            data.file.pipe(file);
            data.file.on('end', function (err) { 
              if (err) {
                callback(err, null);
              } else {
                results.snap_filepath = snap_filepath; 
              }
              callback(null, results);
            });
          } else {
            return reply(Boom.badRequest('File is needed'));
          }
        },
        // 2. compute snap
        function(results, callback) {
          var t1 = new Date();
          request.server.seneca.act({role: 'opencv', cmd: 'compute', filepath: results.snap_filepath}, function (err, result_compute) {
            if (err) return callback(err, null);
            results.snap_compute = result_compute;
            var t2 = new Date();
            results.computedIn = t2-t1;
            callback(null, results);
          });
        },
        // 3. compare
        function(results, callback) {
          var t1 = new Date();
          results.patterns_compare = [];
          // prepare queues
          var q = async.queue(function (task, next) {
            request.server.seneca.act({role: 'opencv', cmd: 'compare', snap: results.snap_filepath, pattern: task.item}, function (err, result_compare) {
              if (err) return next(null, false);
              results.patterns_compare.push(result_compare);
              next(null, true);
            });
          }, 20);
          q.drain = function() {
            var t2 = new Date();
            results.comparedIn = t2-t1;
            callback(null, results);
          };
          _.each(results.patterns, function(pattern) {
            q.push({item:pattern}, function(err) {
              if (err) {}
            });
          });
          /* async.mapLimit(results.patterns, 5, function iterator(item, next) {
            request.server.seneca.act({role: 'opencv', cmd: 'compare', snap: results.snap_filepath, pattern: item}, function (err, result_compare) {
              if (err) return next(null, false);
              results.patterns_compare.push(result_compare);
              next(null, true);
            });
          }, function done(d_err, d_results) {
            var t2 = new Date();
            results.comparedIn = t2-t1;
            callback(d_err, results);
          }); */
        },
        // 4. analayse
        function(results,callback) {
          
          var final_results;
          var id_pattern;
          
          var resmode;
          if ( _.isNull(request.payload.mode) || _.isUndefined(request.payload.mode) ) {
            resmode = 'default-minimalistic';
          } else {
            resmode = request.payload.mode;
            delete request.payload.mode;
          }
          
          delete request.payload.file;
          switch (resmode) {
            
            case 'activity':
              final_results = _.where(results.patterns_compare, { compare:{coincide:true} });
              final_results = _.sortByOrder(final_results, 'good_matches', 'desc');
              final_results = _.pluck(final_results, 'pattern');
              if ( _.isArray(final_results)) {
                if ( final_results.length==0 ) return callback(null, {});
                id_pattern = final_results[0];
                Activity
                .findOne({ patterns: { "$in" : [id_pattern]} })
                .populate('ressources patterns')
                .exec( function(err, activity) {
                  if (err) return callback(err, null);
                  if (_.isNull(activity)) return callback('Activity for Pattern ['+id_pattern+'] not found in database', null);
                  callback(null, activity);
                });
              } else {
                callback(null, {});
              }
              break;
              
            case 'pattern':
              final_results = _.where(results.patterns_compare, { compare:{coincide:true} });
              final_results = _.sortByOrder(final_results, 'good_matches', 'desc');
              final_results = _.pluck(final_results, 'pattern');
  						if ( _.isArray(final_results)) {
  						  if ( final_results.length==0 ) return callback(null, {});
  							id_pattern = final_results[0];
                Pattern.findOne({_id: id_pattern, application:request.params.id}, function(err, pattern) {
                  if (err) return callback(err, null);
  		            if (_.isNull(pattern)) return callback('Pattern ['+id_pattern+'] not found in database', null);
                  callback(null, pattern);
                });
  						} else {
  							callback(null, {});
  						}
              break;
              
            case 'debug':
              callback(null, results);
              break;
              
            case 'default-minimalistic':
              final_results = _.where(results.patterns_compare, { compare:{coincide:true} });
              final_results = _.sortByOrder(final_results, 'good_matches', 'desc');
              final_results = _.pluck(final_results, 'pattern');
  						if ( _.isArray(final_results)) {
  						  if ( final_results.length==0 ) return callback(null, {});
  							id_pattern = final_results[0];
                Pattern.findOne({_id: id_pattern, application:request.params.id}, function(err, pattern) {
                  if (err) return callback(err, null);
  		            if (_.isNull(pattern)) return callback('Pattern ['+id_pattern+'] not found in database', null);
                  callback(null, {name: pattern.name});
                });
  						} else {
  							callback(null, {});
  						}
              break;
          }
        }
        
  		], function(err, results) {
  		  if (err) return reply(Boom.badRequest(err));
  		  reply(results);
  		});
  	} catch (e) {
      reply(Boom.badRequest(e));
  	}
  }
};

exports.batch = {
  auth: {
    strategy: 'jwt',
    scope: ['superu']
  },
  tags: ['api'],
  description: 'Lancer le batch de create/update des patterns pour une application',
  notes: 'Lancer le batch de create/update des patterns pour une application',
  validate: {
    params: {
      id: Joi.string().required()
    }
  },
  jsonp: 'callback',
  handler: function(request, reply) {
    // list all directory patterns
    var volumes_applications = process.env.SNAPBOOK_DIR_APPLICATIONS;
    var dir_path = path.normalize(volumes_applications+'/'+request.params.id+'/uploads'); 
    dir.readFiles( dir_path, {
      match: /.jpg$/,
      exclude: /^\./
    }, function(err, content, next) {
      next(err);
    },
    function(err, files) {
      if (err) {
        console.log(err);
        var boomError = Boom.create(400, err);
        return reply(boomError);
      }
      // run all single computing processes
      async.mapLimit(files, 5, 
        function(item, cb) {
          var params = {
            id: request.params.id,
            filepath: item,
            seneca: request.server.seneca
          };
          batch_one(params, function(error, response) {
            if (error) return cb(null, {item: item, compute: false});
            var r = response;
            r.item = item;
            cb(null, r);
          });
        }, function(err, results) {
          if (err && err.code==='ECONNREFUSED') return reply({alive:false});
          if (err) return reply(Boom.badImplementation());
          reply(results);
        }
      );
    });
  }
};

var batch_one = function(params, reply) {

  if (!params.filepath) return reply(Boom.badRequest('filepath is required.'));
  
  var file = params.filepath;
  var directories = path.dirname(file).split(path.sep);
  var max = directories.length-1;
  
  if ( directories[max] === 'uploads' && fse.lstatSync(file).isFile()) {
      
    console.log('File', file, 'has been added');
    
    async.waterfall([
          
      // initialize
  		function(callback) {
		    var results = {};
		    results.application = directories[max-1];
		    results.filepath = file;
		    results.filename = path.basename(file);
  			callback(null,results);
  		},
  		
  		// get application
      function(results, callback) {
        Application.findOne({ _id : results.application }, function(err,application) {
          if (err) {
            callback(err,null);
          } else {
            results.application = application;
            callback(null,results);
          }
        });
      },
  		
  		// get files stats
      function(results, callback) {
        params.seneca.act({role: 'opencv', cmd: 'analyse', filepath: file}, function (err, result_analyse) {
          if (err) return callback(err, null);
          results.pattern = result_analyse;
          callback(null, results);
        });
      },
	    
	    // insert or update pattern in mongodb ?
      function(results, callback) {
        Pattern.findOne({ filename : results.filename, application: results.application._id }, function(err, pattern) {
      		if (err) {
			    	callback(err,null);
					} else {
						if ( _.isNull(pattern) ) { 
							pattern = new Pattern(pattern);
							pattern.application = results.application._id;
							pattern.name = 'batch: '+results.filename;
      				pattern.description = 'batch: '+results.filename;
							pattern.filename = results.filename;
							pattern = _.merge(pattern, results.pattern);
							pattern.save(function(err) {
						    if (err) {
					        callback(err,null);
						    } else {
					        results.pattern = pattern;
					        console.log(results.filepath, 'CREATE');
					        callback(null, results);
						    }
							});
						} else {
							pattern = _.merge(pattern,results.pattern);
							pattern.filename = results.filename;
							pattern.save(function(err) {
						    if (err) {
					        callback(err,null);
						    } else {
					        results.pattern = pattern;
					        console.log(results.filepath, 'UPDATE');
					        callback(null, results);
						    }
							});
						}
					}
    		});
			},
	    
	    // update application in mongodb ?
      function(results, callback) {
        var pattern_allready_exists = _.findIndex(results.application.patterns, results.pattern._id) !== -1;
        if (pattern_allready_exists===true) {
          callback(null,results);
        } else {
        	results.application.patterns.push(results.pattern._id);
        	results.application.modifiedAt = Date.now();
          results.application.save(function(err) {
            if (err) {
              callback(err,null);
            } else {
              callback(null, results);
            }
          });
        }
      },
	   
	    // batch
	    function(results, callback) {
	    	var destination_filepath = path.normalize(process.env.SNAPBOOK_DIR_APPLICATIONS+'/'+params.id+'/patterns/'+results.pattern._id+'.jpg');
        console.log('file copy', path.normalize(file), destination_filepath);
        fse.copy( path.normalize(file), destination_filepath, {clobber: true}, function(err) {
          if (err) {
            callback(err,null);
          } else {
            params.seneca.act({role: 'opencv', cmd: 'compute', filepath: destination_filepath}, function (err, result_compute) {
              if (err) return callback(err, null);
              results.pattern = result_compute;
              callback(null, results);
            });
          }
        });
	    },
	
  	], function(err, results) {
	    if (err) return reply(Boom.badRequest(err), null);
	    reply(null, results.pattern);
  	});
    
  } else {
    return reply(Boom.badRequest('filepath is not good.'));
  }
  
};

/**********************
 * RETHINKDB
 ***/

exports.thinky_list = {
  auth: {
    strategy: 'jwt',
    scope: ['application', 'superu']
  },
  tags: ['api'],
  description: 'Obtenir toutes les application',
  notes: 'Obtenir toutes les application',
  validate: {
  },
  jsonp: 'callback',
  handler: function(request, reply) {
    request.server.domain.FindApplicationsQuery({}, function(err, applications) {
      if (err) {
        request.server.logger.error(err);
        return reply(Boom.badRequest(err));
      }
      reply(applications);
    });
  }
};

exports.thinky_read = {
  auth: {
    strategy: 'jwt',
    scope: ['application', 'superu']
  },
  tags: ['api'],
  description: 'Obtenir les détails d\'une application',
  notes: 'Obtenir les détails d\'une application',
  validate: {
    params: {
      id: Joi.string().required()
    }
  },
  jsonp: 'callback',
  handler: function(request, reply) {
    request.server.domain.GetApplicationPopulateQuery(request.params.id, function(err, application) {
      if (err) {
        request.server.logger.error(err);
        return reply(Boom.badRequest(err));
      }
      reply(application);
    });
  }
};

exports.thinky_create = {
  auth: {
    strategy: 'jwt',
    scope: ['superu']
  },
  tags: ['api'],
  description: 'Ajouter une application sur snapbook',
  notes: 'Ajouter une application sur snapbook',
  payload: {
    allow: 'application/x-www-form-urlencoded',
  },
  validate: {
    payload: {
      name: Joi.string().required()
    }
  },
  jsonp: 'callback',
  handler: function(request, reply) {
    request.server.domain.CreateApplicationCommand(request.payload, function(err, application) {
      if (err) {
        request.server.logger.error(err);
        return reply(Boom.badRequest(err));
      }
      reply(application);
    });
  }
};