"use strict";

var path = require('path');

exports.dashboard = {
  handler: {
    directory: {
      path: require('path').resolve(__dirname, '../../dashboard'),
      listing: true
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
      path: require('path').resolve(__dirname, '../../bower_components'),
      listing: false
    }
  }
};