"use strict";

var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var ActivitySchema = new Schema({
  data: { type: Schema.Types.Mixed },
  // global manuel
  type: { type: String, required: true, trim: true, default: '' }, // LIBRE EN FONCTION DE APPLICATION
  name: { type: String, required: true, trim: true, default: '' }, 
  description: { type: String, trim: true, default: '' },
  // relationships
  application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
  // collections
  activities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }],
  patterns: [{ type: Schema.Types.ObjectId, ref: 'Pattern' }],
  ressources: [{ type: Schema.Types.ObjectId, ref: 'Ressource' }]
});

ActivitySchema.set('versionKey', false);
module.exports = Mongoose.model('Activity', ActivitySchema, 'activities');