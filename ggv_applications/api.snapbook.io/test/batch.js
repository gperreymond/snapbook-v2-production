"use strict";

var fse = require('fs-extra');
var path = require('path');
var async = require('async');
var opencv = require('ggv-opencv');
var gm = require('gm');

var t1, t2;
var T1, T2;

var rootDir = '/home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_applications/api.snapbook.io/test/patterns';
var files = fse.readdirSync(rootDir);

var batch = function() {
  T1 = new Date();
  async.eachSeries(files, function iterator(file, callback) {
    var filepath = rootDir+'/'+file;
    var stat = fse.statSync(filepath);
    if (stat.isFile()) {
      compute(filepath, function() {
        callback(null, true);
      });
    } else {
      callback(null, false);
    }
  }, function done() {
    T2 = new Date();
    console.log('done', T2-T1);
  });
};

var compute = function(filepath, callback) {
  var fileext = path.extname(filepath);
  var filename = path.basename(filepath, fileext);
  console.log(filename);
  t1 = new Date();
  gm(rootDir+'/'+filename+'.jpg')
  .resize(512, 512)
  //.borderColor('#ff00ff')
  //.border(50, 50)
  .noProfile()
  .write(rootDir+'/thumbs/'+filename+'.jpg', function(err) {
    t2 = new Date();
    console.log('>>>', 'gm.prepare', t2-t1);
    t1 = new Date();
    opencv.loadImage(rootDir+'/thumbs/'+filename+'.jpg', function(err, imview) {
      t2 = new Date();
      console.log('>>>', 'opencv.loadImage', t2-t1);
      t1 = new Date();
      imview.compute('AKAZE', function(err, imview_compute) {
        t2 = new Date();
        console.log('>>>', 'opencv.compute', t2-t1);
        t1 = new Date();
        fse.writeFileSync(rootDir+'/keypoints/'+filename+'.yml', imview.keypoints());
        fse.writeFileSync(rootDir+'/descriptors/'+filename+'.yml', imview.descriptors());
        imview_compute.asPngStream(function(err, data) {
          fse.writeFileSync(rootDir+'/computes/'+filename+'.png', new Buffer(data));
          t2 = new Date();
          console.log('>>>', 'files saved', t2-t1);
          callback();
        });
      });
    });
  });
};

batch();