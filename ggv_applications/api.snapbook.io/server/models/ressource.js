"use strict";

var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var RessourceSchema = new Schema({
	data: { type: Schema.Types.Mixed },
	// global manuel
	type: { type: String, required: true, trim: true, default: '' }, // LIBRE EN FONCTION DE APPLICATION
 	name: { type: String, required: true, trim: true, default: '' }, 
 	description: { type: String, trim: true, default: '' },
 	// relationships
 	application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
});

RessourceSchema.set('versionKey', false);
module.exports = Mongoose.model('Ressource', RessourceSchema, 'ressources');