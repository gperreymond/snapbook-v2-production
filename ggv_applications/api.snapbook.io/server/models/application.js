"use strict";

var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var ApplicationSchema = new Schema({
	// fields
	name: { type: String, required: true, trim: true, default: '' }, 
	cover: { type: String, trim: true, default: '' },
	description: { type: String, trim: true, default: '' },
	createdAt: { type: Date, default: Date.now },
	modifiedAt: { type: Date, default: Date.now },
	// relationships
	auth: { type: Schema.Types.ObjectId, ref: 'User' },
	patterns: [{ type: Schema.Types.ObjectId, ref: 'Pattern' }],
	ressources: [{ type: Schema.Types.ObjectId, ref: 'Ressource' }],
	activities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }]
});
		
ApplicationSchema.set('versionKey', false);
module.exports = Mongoose.model('Application', ApplicationSchema, 'applications');