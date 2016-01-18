"use strict";

var Boom = require('boom');
var Snaps = require('.././models/snap');

exports.read_limit = {
  auth: false,
  handler: function(request, reply) {
    var limit = encodeURIComponent(request.params.limit);
  	Snaps
  	.find({'meta.mode':'activity','meta.application':request.params.application,'meta.coincide':true})
  	.sort({timestamp:-1})
  	.limit(limit)
  	.exec(function(err, data) {
  		if (err) return reply(Boom.badRequest(err));
  		reply(data);
  	});
  }
};