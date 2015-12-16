"use strict";

var fse = require('fs-extra');
var path = require('path');
var async = require('async');
var opencv = require('ggv-opencv');
var gm = require('gm');

var t1, t2;
var T1, T2;

var rootDir = '/home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_applications/api.snapbook.io/test';

var patterns = fse.readdirSync(rootDir+'/patterns');
var snap = '4fea2bd6-5ec2-4da1-8015-c1a036cc7c7b.jpg';

var cargo = async.cargo(function (tasks, callback) {
    for(var i=0; i<tasks.length; i++) {
      console.log('hello ' + tasks[i].name);
    }
    callback();
}, 8);

var compare = function() {
  T1 = new Date();
  // snap
  compute(snap, 'snaps', function(err, imview) {
    // patterns
    var g_results = [];
    // cargo
    async.map(patterns, function iterator(pattern, callback) {
      var patternpath = rootDir+'/patterns/'+pattern;
      var stat = fse.statSync(patternpath);
      if (stat.isFile()) {
        cargo.push({name: pattern}, function (err) {
          console.log('finished processing', pattern);
          callback(null, true);
        });
      } else {
        callback(null, false);
      }
    }, function done() {
      T2 = new Date();
      console.log(g_results);
      console.log('done', T2-T1);
    });
    // classical
    /*async.map(patterns, function iterator(pattern, callback) {
      var patternpath = rootDir+'/patterns/'+pattern;
      var stat = fse.statSync(patternpath);
      if (stat.isFile()) {
        var fileext = path.extname(pattern);
        var id = path.basename(pattern, fileext);
        console.log('pattern', id);
        var keypointsFile = path.normalize(rootDir+'/patterns/keypoints/'+id+'.yml');
        var descriptorsFile = path.normalize(rootDir+'/patterns/descriptors/'+id+'.yml');
        imview.compare(keypointsFile, descriptorsFile, function(err, result) {
          if (err) return callback(null, {coincide:false});
          var results = {};
          if ( result===0 ) {
            results.coincide = false;
          } else {
            results.coincide = true;
            results.good_matches = result;
          }
          g_results.push(results);
          callback(null, true);
        });
      } else {
        callback(null, false);
      }
    }, function done() {
      T2 = new Date();
      console.log(g_results);
      console.log('done', T2-T1);
    });*/
  });
};

var compare = function(finame, callback) {
  
};

var compute = function(filename, mode, callback) {
  var fileext = path.extname(filename);
  var id = path.basename(filename, fileext);
  console.log(id);
  t1 = new Date();
  gm(rootDir+'/'+mode+'/'+filename)
  .resize(512, 512)
  .borderColor('#ff00ff')
  .border(50, 50)
  .noProfile()
  .write(rootDir+'/'+mode+'/thumbs/'+id+'.jpg', function(err) {
    t2 = new Date();
    console.log('>>>', 'gm.prepare', t2-t1);
    t1 = new Date();
    opencv.loadImage(rootDir+'/'+mode+'/thumbs/'+id+'.jpg', function(err, imview) {
      t2 = new Date();
      console.log('>>>', 'opencv.loadImage', t2-t1);
      t1 = new Date();
      imview.compute('AKAZE', function(err, imview_compute) {
        t2 = new Date();
        console.log('>>>', 'opencv.compute', t2-t1);
        t1 = new Date();
        fse.writeFileSync(rootDir+'/'+mode+'/keypoints/'+id+'.yml', imview.keypoints());
        fse.writeFileSync(rootDir+'/'+mode+'/descriptors/'+id+'.yml', imview.descriptors());
        imview_compute.asPngStream(function(err, data) {
          fse.writeFileSync(rootDir+'/'+mode+'/computes/'+id+'.png', new Buffer(data));
          t2 = new Date();
          console.log('>>>', 'files saved', t2-t1);
          callback(null, imview);
        });
      });
    });
  });
};

compare();