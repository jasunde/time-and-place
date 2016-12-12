var regionMap = require('../config').regionMap;
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var District = require('../models/district');

function getSubRegions(req, res) {
  District.findOne({'properties.dist_num': '12'}, function (err, district) {
    if(err) {
      console.log('findOne district error:', err);
      res.sendStatus(500);
    } else {
      console.log(district);
      res.send(district);
    }
  });
}

router.get('/', getSubRegions);

module.exports = router;
