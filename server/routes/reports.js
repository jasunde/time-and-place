// Interfaces with the angular reports service and Chicago API
// - builds queries from reports service info
// - queries the API
// - returns response to reports service

var express = require('express');
var router = express.Router();
var request = require('request');
var secrets = require('../secrets');
var moment = require('moment');
var regionMap = require('../config').regionMap;

// Clauses closely resemble SQL but are in fact SoQL
// Setup from https://dev.socrata.com/foundry/data.cityofchicago.org/6zsd-86xi

// base for any resource in Chicago API
var baseUrl = 'https://data.cityofchicago.org/resource/',
    // Crime dataset identifier
    dataset = '6zsd-86xi',
    // Desired response type extension
    dataType = '.json?',
    token = '$$app_token=' + secrets.chicagoApiAppToken,
    // Prefix for a general query to API
    queryType = '&$query=',
    query = '',
    url = '',
    dateFormat = 'YYYY-MM-DDTHH:mm';

// TODO: filter data on the database

/**
 * Build the endpoint for a query
 * @param  String query   SoQL query string
 * @return String         URL endpoint for query to API
 */
function buildQueryUrl(query) {
  return baseUrl + dataset + dataType + token + queryType + encodeURI(query);
}


/**
 * Build actual SoQL query
 * @param  {Object} regionPath req.params object
 * @return {String}            String query
 */
function groupByRegion(queryObj) {
  var subRegion = queryObj.subRegion;
  var timeFrame = JSON.parse(queryObj.timeFrame);

  query = 'SELECT ' + subRegion + ' AS region, COUNT(*) AS reports';

  // if time frame exists
  if(timeFrame) {
    query += " WHERE date>'" + moment(timeFrame.startMoment).format(dateFormat) + "'" +
      " AND date<'" + moment(timeFrame.endMoment).format(dateFormat) + "'";
  }

  // if deeper than top level region
  if(queryObj.region) {
    var region = JSON.parse(queryObj.region);
    query += " AND " + region.type + "='" + region.id + "'";
  }

  query += ' GROUP BY ' + subRegion;

  console.log('See the query:', query);
  return query;
}

/**
 * Make request to SoQL endpoint
 * @param  {String}  query  SQL query string
 * @return {JSON}           Results of query
 */
function makeRequest(query) {
  // TODO: use pipe to send along responses
}

/**
 * Add property of number of poperties in obj to obj as length
 * @param {Object} obj Any object
 * @return {Object}
 */
function addLengthProp(obj) {
  var arr = Object.keys(obj);
  obj.length = 0;
  arr.forEach(function() {
    obj.length++;
  });
  return obj;
}

function regionCallback(req, res) {
  url = buildQueryUrl(groupByRegion(req.query));
  console.log(url);
  return request.get(url, function (error, response, body) {
    if(error) {
      console.log('GET request error:', err);
      res.sendStatus(500);
    }

    if(!error && response.statusCode === 200) {
      res.send(body);
    }
  });
}

// TODO: get overall city data instead
// Get district data
router.get('/', regionCallback);

module.exports = router;
