"use strict";

var path = require('path');

exports.dashboard = {
  handler: {
    directory: {
      path: 'dashboard',
      listing: false
    }
  }
};

exports.snaps = {
  handler: {
    directory: {
      path: path.normalize(process.env.SNAPBOOK_DIR_APPLICATIONS+'/uploads'),
      listing: true
    }
  }
};

exports.bower_components = {
  handler: {
    directory: {
      path: 'bower_components',
      listing: false
    }
  }
};