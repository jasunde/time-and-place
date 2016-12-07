var express = require('express');
var router = express.Router();
var request = require('request');
var secrets = require('./secrets');
// Clauses closely resemble SQL but are in fact SoQL
// Setup from https://dev.socrata.com/foundry/data.cityofchicago.org/6zsd-86xi

// base for any resource in Chicago API
var baseUrl = 'https://data.cityofchicago.org/resource/',
    datasets = {
      // Dataset identifier for crime
      crime: '6zsd-86xi',
      community_area: 'igwz-8jzy'
    };
    // Desired response type extension
    dataType = '.json?',
    // Prefix for a general query to API
    queryType = '$query=',
    token = '$$app_token=' + secrets.chicagoApiAppToken;

var request = {
  url: '',
  method: "GET"
};

/**
 * Build the endpoint for a query
 * @param  String query   SoQL query string
 * @return String         URL endpoint for query to API
 */
function buildQueryUrl(dataset, query) {
  return baseUrl + datasets[dataset] + dataType + token + '&' + queryType + encodeURI(query);
}

/**
 * Make request to SoQL endpoint
 * @param  String  query  SQL query string
 * @return JSON           Results of query
 */
function makeRequest(dataset, query) {
  request.url = buildQueryUrl(dataset, query);

  return $http(request)
  .then(function (data) {
    return data;
  })
  .catch(function (err) {
    console.log('GET request error:', err);
  });
}

router.get('/', function(req, res) {

});

module.exports = router;
