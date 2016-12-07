var express = require('express');
var router = express.Router();
var request = require('request');
var secrets = require('../secrets');
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
    url = '';

/**
 * Build the endpoint for a query
 * @param  String query   SoQL query string
 * @return String         URL endpoint for query to API
 */
function buildQueryUrl(region) {
  query = ['SELECT', region + ',', 'COUNT(*) AS reports GROUP BY', region].join(' ');
  console.log(query);
  return baseUrl + dataset + dataType + token + queryType + encodeURI(query);
}

/**
 * Make request to SoQL endpoint
 * @param  String  query  SQL query string
 * @return JSON           Results of query
 */
function makeRequest(query) {
  // TODO: use pipe to send along responses
}

// Get overall city data
router.get('/', function(req, res) {
  url = buildQueryUrl('community_area');
  return request.get(url, function (error, response, body) {
    if(error) {
      console.log('GET request error:', err);
      res.sendStatus(500);
    }

    if(!error && response.statusCode === 200) {
      res.send(body);
    }
  });
});

module.exports = router;
