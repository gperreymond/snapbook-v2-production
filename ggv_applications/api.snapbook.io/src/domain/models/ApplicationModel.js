"use strict";

module.exports = function(thinky) {

  var type = thinky.type;
  
  var ApplicationModel = thinky.createModel("applications", {
    // fields
    name: type.string().required(),
    description: type.string(),
    // relationships
    auth: type.string(),
    patterns: type.array(),
	  ressources: type.array(),
	  activities: type.array(),
    // automatic
    createdAt: type.date().required(),
    modifiedAt: type.date().required()
  }); 

  ApplicationModel.pre('save', function(next) {
    var application = this;
    next();
  });
  
  return ApplicationModel;
  
};