"use strict";

var Promise = require("bluebird");

var options = {
  host: process.env.SNAPBOOK_RETHINKDB_HOST,
  port: process.env.SNAPBOOK_RETHINKDB_PORT,
  db: process.env.SNAPBOOK_RETHINKDB_DATABASE,
  authKey: process.env.SNAPBOOK_RETHINKDB_AUTH_KEY
};
var thinky = require('thinky')(options);

module.exports = {
  
  // injected
  logger: null,
  io: null,
  thinky: thinky,
  ThinkyErrors: thinky.Errors,
  
  // models
  UserModel: require('./models/UserModel')(thinky),
  ApplicationModel: require('./models/ApplicationModel')(thinky),
  
  // commands
  ValidateDataCommand: Promise.promisify(require('./commands/ValidateDataCommand')),
  SaveDataCommand: Promise.promisify(require('./commands/SaveDataCommand')),
  CreateUserCommand: Promise.promisify(require('./commands/CreateUserCommand')),
  CreateApplicationCommand: Promise.promisify(require('./commands/CreateApplicationCommand')),
  CreateApplicationAuthentificationCommand: Promise.promisify(require('./commands/CreateApplicationAuthentificationCommand')),
  
  // queries
  GetApplicationQuery: Promise.promisify(require('./queries/GetApplicationQuery')),
  GetUserQuery: Promise.promisify(require('./queries/GetUserQuery')),
  FindUsersQuery: Promise.promisify(require('./queries/FindUsersQuery')),
  FindApplicationsQuery: Promise.promisify(require('./queries/FindApplicationsQuery')),
  UserEmailAlreadyExistsQuery: Promise.promisify(require('./queries/UserEmailAlreadyExistsQuery')),
  GetApplicationPopulateQuery: Promise.promisify(require('./queries/GetApplicationPopulateQuery')),
  
  // events
  
  // listeners
  
};