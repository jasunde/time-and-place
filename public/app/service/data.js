angular.module('reportApp')
.factory('Data', ['$http', '$sce', function DataFactory($http, $sce) {
  // Clauses closely resemble SQL but are in fact SoQL
  // Setup from https://dev.socrata.com/foundry/data.cityofchicago.org/6zsd-86xi

  var baseUrl = 'https://data.cityofchicago.org/resource/', // base for any resource in Chicago API
      datasets = {
        crime: '6zsd-86xi',
        community_area: 'igwz-8jzy'
      }; // Dataset identifier for crime
      dataType = '.json?', // Desired response type extension
      queryType = '$query=',
      token = '$$app_token=myXK7GaCPuxI4HIdnqFX5So05';

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

  /**
   * Get the dataset for the next level down within region
   * @param  {String}   regionType Name of regionType
   * @param  {Integer}  regionID   ID number of region
   * @return {Array}               Object with Array of crimes per-subregion
   */
  // function drillDown(regionType, regionID) {
  //
  // }

  return {
    query: makeRequest
  };
}]);
