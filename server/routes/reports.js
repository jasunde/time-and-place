var express = require('express');
var router = express.Router();
var request = require('request');
var secrets = require('../secrets');
var moment = require('moment');
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
    dateFormat = 'YYYY-MM-DDTHH:mm',
    regionMap = [
      'district',
      'beat',
      'block',
    ];

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
function groupByRegion(params, query) {
  regionPath = addLengthProp(params);
  if(query.timeFrame) {
    var timeFrame = JSON.parse(query.timeFrame);
  }

  subRegion = regionMap[regionPath.length];
  query = 'SELECT ' + subRegion + ' AS region, COUNT(*) AS reports';

  // 2016-12-08T16:43

  // if time frame exists
  if(timeFrame) {
    query += " WHERE date>'" + moment(timeFrame.startDate).format(dateFormat) + "'" +
      " AND date<'" + moment(timeFrame.endDate).format(dateFormat) + "'";
  }

  // if deeper than top level region
  if(regionPath.length) {
    region = regionMap[regionPath.length - 1];
    query += " AND " + region + "='" + regionPath[region] + "'";
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
  url = buildQueryUrl(groupByRegion(req.params, req.query));
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
// Get beat data
router.get('/:' + regionMap[0], regionCallback);
// Get block data
router.get('/:' + regionMap[0] + '/:' + regionMap[1], regionCallback);


module.exports = router;
