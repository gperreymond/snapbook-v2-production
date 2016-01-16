"use strict";

var path = require('path');
var fse = require('fs-extra');
var gm = require('gm');
var md5 = require('md5');
var opencv = require('ggv-opencv');

exports.analyse = function (msg, respond) {
  console.log('opencv', 'analyse', msg.filepath);
  try {
    gm( msg.filepath)
    .identify(function(err, data) {
      if (err) return respond(err,null);
      var stats = {};
      var fstats = fse.lstatSync(msg.filepath);
      stats.md5 = md5(msg.filepath);
      stats.size = fstats.size;
      stats.format = data.format;
      stats.channel = data['Channel Statistics'];
      stats.date = new Date();
      stats.width = data.size.width;
      stats.height = data.size.height;
      respond(null, stats);
    });
  } catch (e) {
    respond(e,null);
  }
};

exports.compare = function (msg, respond) {
  console.log('opencv', 'compare', msg.pattern);
  var t1, t2;
  var snap_filepath = msg.snap;
  var snap_dirname = path.dirname(snap_filepath);
  var snap_extname = path.extname(snap_filepath);
  var snap_basename = path.basename(snap_filepath, snap_extname);
  var pattern_filepath = msg.pattern;
  var pattern_dirname = path.dirname(pattern_filepath);
  var pattern_extname = path.extname(pattern_filepath);
  var pattern_basename = path.basename(pattern_filepath, pattern_extname);
  t1 = new Date();
  opencv.loadImage(snap_dirname+'/thumbs/'+snap_basename+'-thb.jpg', function(err, imview) {
    if (err) return respond(err, null);
    //imview.compute('AKAZE', function(err, imview_compute) {
    imview.prepare(snap_dirname+'/keypoints/'+snap_basename+'-kpts.yml', snap_dirname+'/descriptors/'+snap_basename+'-dcts.yml', function(err, result) {
      if (err) return respond(err, null);
      imview.compare(pattern_dirname+'/keypoints/'+pattern_basename+'-kpts.yml', pattern_dirname+'/descriptors/'+pattern_basename+'-dcts.yml', function(err, result) {
        if (err) return respond(err, null);
        var r = {};
        if ( result===0 ) {
          r.coincide = false;
        } else {
          r.coincide = true;
          r.good_matches = result;
        }
        t2 = new Date();
        respond(null, {pattern: pattern_basename, exec: t2-t1, compare: r});
      });
    });
  });
};

exports.compute = function (msg, respond) {
  console.log('opencv', 'compute', msg.filepath);
  var t1, t2;
  var result = {};
  var filepath = msg.filepath;
  var dirname = path.dirname(filepath);
  var extname = path.extname(filepath);
  var basename = path.basename(filepath, extname);
  fse.ensureDirSync(dirname+'/thumbs/');
  fse.ensureDirSync(dirname+'/keypoints/');
  fse.ensureDirSync(dirname+'/descriptors/');
  fse.ensureDirSync(dirname+'/computes/');
  // gm : create thumb
  t1 = new Date();
  gm(filepath)
  .resize(512, 512)
  .noProfile()
  .write(dirname+'/thumbs/'+basename+'-thb.jpg', function(err) {
    if (err) return respond(err, null);
    t2 = new Date();
    result.step_1_create_thumb = t2-t1;
    // opencv : load thumb
    t1 = new Date();
    opencv.loadImage(dirname+'/thumbs/'+basename+'-thb.jpg', function(err, imview) {
      if (err) return respond(err, null);
      t2 = new Date();
      result.step_2_load_thumb = t2-t1;
      // opencv : compute AKAZE
      t1 = new Date();
      imview.compute('AKAZE', function(err, imview_compute) {
        if (err) return respond(err, null);
        t2 = new Date();
        result.step_3_compute_thumb_akaze = t2-t1;
        // files : save keypoints & descriptors & computed image
        t1 = new Date();
        fse.writeFileSync(dirname+'/keypoints/'+basename+'-kpts.yml', imview.keypoints());
        fse.writeFileSync(dirname+'/descriptors/'+basename+'-dcts.yml', imview.descriptors());
        imview_compute.asPngStream(function(err, data) {
          if (err) return respond(err, null);
          fse.writeFileSync(dirname+'/computes/'+basename+'-cpte.png', new Buffer(data));
          t2 = new Date();
          result.step_4_save_files = t2-t1;
          result.keypoints = dirname+'/keypoints/'+basename+'-kpts.yml';
          result.descriptors = dirname+'/descriptors/'+basename+'-dcts.yml';
          respond(null, result);
        });
      });
    });
  });
};
  
