"use strict";

var Boom = require('boom');
var async = require('async');
var _ = require('lodash');
var uuid = require('uuid');
var fse = require('fs-extra');
var path = require('path');
var fs = require('fs');

var ms_opencv = require('seneca')()
.client({
  type: 'tcp',
  host: 'localhost',
  port: '10120'
});

exports.compare = {
  auth: false,
  payload: {
  	maxBytes: 5242880,
    output: 'stream',
    parse: true,
    allow: 'multipart/form-data'
  },
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
          ms_opencv
          .act({role: 'opencv', cmd: 'compute', filepath: results.snap_filepath}, function (err, result_compute) {
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
            ms_opencv
            .act({role: 'opencv', cmd: 'compare', snap: results.snap_filepath, pattern: task.item}, function (err, result_compare) {
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
          /*async.mapLimit(results.patterns, 5, function iterator(item, next) {
            ms_opencv
            .act({role: 'opencv', cmd: 'compare', snap: results.snap_filepath, pattern: item}, function (err, result_compare) {
              if (err) return next(null, false);
              results.patterns_compare.push(result_compare);
              next(null, true);
            });
          }, function done(d_err, d_results) {
            var t2 = new Date();
            results.comparedIn = t2-t1;
            callback(d_err, results);
          });*/
        },
  		    
  		    /////////////////////////////////////////
  		    // 3. analyse
  		    /////////////////////////////////////////
  		    
  		    /*function(results,callback) {
      			var list_patterns = _.pluck(results.compare_results, 'pattern');
      			var final_results;
      			var id_pattern;
      			
      			var resmode;
      			if ( _.isNull(request.payload.mode) || _.isUndefined(request.payload.mode) ) {
      				resmode = 'debug';
      			} else {
      				resmode = request.payload.mode;
      				delete request.payload.mode;
      			}*/
  				
  				// logs
  				/*delete request.payload.file;
  		    	logger = {
  	    	        message: resmode,
  	    	        metadata: {
  	    	        	request: {
  	    	        		headers: request.headers,
  	    	        		payload: request.payload
  	    	        	},
  	    	        	mode: resmode,
  	    	        	snapfile: results.snapfile,
  	    	        	application: request.params.id,
  	    	        	compare_time: results.logs.compare,
  	    	        	compare_patterns: _.pluck(_.sortByOrder(results.compare_results, 'good_matches', 'desc'), 'pattern')
  	    	        }
  	    	    };
  	    	    logger.metadata.coincide = logger.metadata.compare_patterns.length>0;
  	    	    
  		    	switch (resmode) {
  					case 'activity':
  						final_results = _.pluck(_.sortByOrder(results.compare_results, 'good_matches', 'desc'), 'pattern');
  						if ( _.isArray(final_results)) {
  							id_pattern = final_results[0];
  							Activities
  							.findOne({ patterns: { "$in" : [id_pattern]} })
  							.populate('ressources patterns')
  							.exec( function(err,activity) {
  								if ( err ) {
  			                		errorEvent = new ErrorEvent(418,'ERROR_TYPE_APPLICATIONS_COMPARE',err);
  									callback(errorEvent,results);
  				            	} else {
  				            		final_results = activity;
  				            		logger.metadata.activity = (_.isNull(activity)) ? false : activity._id.toString();
  									callback(null,final_results);
  				            	}
  							});
  						} else {
  							final_results = {};
  							callback(null,final_results);
  						}
  						break;
  					case 'pattern':
  						final_results = _.pluck(_.sortByOrder(results.compare_results, 'good_matches', 'desc'), 'pattern');
  						if ( _.isArray(final_results)) {
  							id_pattern = final_results[0];
  							Patterns.findOne({_id: id_pattern},function(err,pattern){
  								if ( err ) {
  			                		errorEvent = new ErrorEvent(418,'ERROR_TYPE_APPLICATIONS_COMPARE',err);
  									callback(errorEvent,results);
  				            	} else {
  				            		final_results = pattern;
  				            		logger.metadata.pattern = (_.isNull(pattern)) ? false : pattern._id.toString();
  									callback(null,final_results);
  				            	}
  							});
  						} else {
  							final_results = {};
  							callback(null,final_results);
  						}
  						break;
  					case 'debug':
  						Patterns.find({ '_id' : { $in : list_patterns } },function(err, patterns) {
  							if (err) {
  								errorEvent = new ErrorEvent(418,'ERROR_ANALYSE',err);
  								callback(errorEvent,results);
  							} else {
  								results.patterns = patterns;
  								callback(null,results);
  							}
  						});
  						break;
  		    	}
  		    }*/
  		    
  		], function(err, results) {
  		  if (err) return reply(Boom.badRequest(err));
  		  reply(results);
  			/*if (err) {
  				err.dispatch(reply);
  		    } else {
  		    	if ( _.isNull(results) ) results = {};
  				server.methods.ExecLogger('snaps',logger);
  		    	reply(results);
  		    }*/
  		});
  	} catch (e) {
      reply(Boom.badRequest(e));
  	}
  }
};