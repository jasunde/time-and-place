var regionMap = require('../config').regionMap;
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

function getSubRegions(req, res) {
  console.log(regionMap);
  res.sendStatus(200);
}

router.get('/', getSubRegions);

module.exports = router;
