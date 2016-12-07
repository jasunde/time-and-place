angular.module('reportApp')
.factory('Data', ['$http', function DataFactory($http) {


  function makeRequest(regionPath) {
    var path = '/reports/' + regionPath.join('/');
    return $http.get(path)
    .then(function (response) {
      return response;
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
