"use strict";

var StaticsController = require('./controllers/statics');
var UsersController = require('./controllers/users');
var SnapsController = require('./controllers/snaps');
var ApplicationsController = require('./controllers/applications');

exports.endpoints = [
  // statics
  { method: 'GET', path: '/dashboard/{param*}', config: StaticsController.dashboard},
  { method: 'GET', path: '/media/snaps/{param*}', config: StaticsController.snaps},
  { method: 'GET', path: '/libs/{param*}', config: StaticsController.bower_components},
  // auth
  { method: 'POST', path: '/auth/local', config: UsersController.local},
  { method: 'GET', path: '/auth/me', config: UsersController.me},
  // snaps
  { method: 'GET', path: '/snaps/{application}/lasted/{limit}', config: SnapsController.read_limit},
  // applications
  { method: 'POST', path: '/applications/create', config: ApplicationsController.create},
  { method: 'GET', path: '/applications', config: ApplicationsController.list},
  { method: 'GET', path: '/applications/{id}', config: ApplicationsController.read},
  { method: 'POST', path: '/applications/{id}/compare', config: ApplicationsController.compare},
  { method: 'POST', path: '/applications/{id}/batch/patterns', config: ApplicationsController.batch},
  // patterns
];