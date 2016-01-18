"use strict";

var StaticsController = require('./gateway/statics');
var UsersController = require('./gateway/users');
var SnapsController = require('./gateway/snaps');
var ApplicationsController = require('./gateway/applications');
var RessourcesController = require('./gateway/ressources');

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
  // ressources
  { method: 'POST', path: '/ressources/create', config: RessourcesController.create},
  { method: 'PATCH', path: '/ressources/{id}/update', config: RessourcesController.create},
  
  // thinky :: users
  { method: 'POST', path: '/thinky/users/create', config: UsersController.thinky_create},
  // thinky :: applications
  { method: 'GET', path: '/thinky/applications', config: ApplicationsController.thinky_list},
  { method: 'POST', path: '/thinky/applications/create', config: ApplicationsController.thinky_create},
  { method: 'GET', path: '/thinky/applications/{id}', config: ApplicationsController.thinky_read},
];