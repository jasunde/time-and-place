angular.module('reportApp')
.factory('Reports', ['$http', function ReportsFactory($http) {

  var config = {};

  function byRegion(regionPath, timeFrame) {
    // set params
    config = {
      params: {
        timeFrame: 'hello'
      }
    }; 

    console.log(config);
    // create the path
    path = '/reports/' + regionPath.join('/');

    // send the request
    return $http.get(path, config)
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
    byRegion: byRegion
  };
}]);
