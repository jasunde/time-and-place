var regionMap = require('../config').regionMap;
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var District = require('../models/district');
var Beat = require('../models/beat');
var Block = require('../models/block');
var d3 = require('d3-format');

function getSubRegions(req, res) {
  console.log('req.query:', req.query);

  switch (req.query.type) {
    case 'city':
    getByCity(req, res);
    break;
    case 'district':
    getByDistrict(req, res);
    break;
    case 'beat':
    getByBeat(req, res);
    break;
    default:
    console.log('Get subRegions request error.', req.query);
    res.sendStatus(500);
  }
}

function getByCity(req, res) {
  District.find(function (err, districts) {
    var format = d3.format('0>3');
    if(err) {
      console.log('getByCity error:', err);
      res.sendStatus(500);
    } else {
      districts.forEach(function (district) {
        district.set('properties.id', format(district.properties.dist_num));
        district.set('properties.type', 'district');
      });
      res.send(districts);
    }
  });
}

function getByDistrict(req, res) {
  var format = d3.format('0>2');
  var dist = format(+req.query.id);
  Beat.find({'properties.district': dist}, function (err, beats) {
    if(err) {
      console.log('getByDistrict error:', err);
      res.sendStatus(500);
    } else {
      beats.forEach(function (beat) {
        beat.set('properties.id', beat.properties.beat_num);
        beat.set('properties.type', 'beat');
      })
      res.send(beats);
    }
  });
}

function getByBeat(req, res) {
  var parentBeat;
  Beat.findOne({'properties.beat_num': req.query.id}, function (err, beat) {
    if(err) {
      console.log('getByBeat: beat not found', err);
      res.sendStatus(500);
    } else {
        Block.find({
          'geometry': {
            $geoIntersects: {
              $geometry: beat.geometry
            }
          }
      }, function (err, blocks) {
        if(err) {
          console.log('Find Block error:', err);
          res.sendStatus(500);
        } else {
          blocks.forEach(function (block) {
            block.set('properties.id', block.properties['block_name']);
            block.set('properties.type', 'block');
          })
          res.send(blocks);
        }
      });
    }
  });
}

router.get('/', getSubRegions);

module.exports = router;
