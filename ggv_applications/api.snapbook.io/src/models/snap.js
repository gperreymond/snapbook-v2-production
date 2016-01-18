"use strict";

var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var SnapSchema = new Schema({
	message: { type: String, trim: true },
	timestamp: { type: Date },
	level: { type: String, trim: true },
  meta: { type: Schema.Types.Mixed }
});
        
SnapSchema.set('versionKey', false);
module.exports = Mongoose.model('Snap', SnapSchema, 'stats-snaps');