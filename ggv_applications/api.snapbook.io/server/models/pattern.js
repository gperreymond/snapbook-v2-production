"use strict";

var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var PatternSchema = new Schema({
	// fields
 	name: { type: String, required: true, trim: true, default: '' }, 
 	description: { type: String, trim: true, default: '' },
	// fields auto
	filename: { type: String, trim: true, default: '' },
	md5: { type: String, trim: true, default: '' },
	format: { type: String, trim: true, default: '' },
	date: { type: Date },
	size: { type: Number, default: 0 },
	width: { type: Number, default: 0 },
	height: { type: Number, default: 0 },
 	// relationships
 	application: { type: Schema.Types.ObjectId, ref: 'Application' }
});

PatternSchema.set('versionKey', false);

module.exports = Mongoose.model('Pattern', PatternSchema, 'patterns');