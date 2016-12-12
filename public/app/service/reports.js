// Gets and stores data from the Chicago API about reports
angular.module('reportApp')
.factory('Reports', ['$http', function ReportsFactory($http) {

  var config = {};

  function bySubRegion(query) {
    // set params
    config = {
      params: query
    };

    // send the request
    return $http.get('/reports', config)
    .then(function (response) {
      // only return the data
      return response.data;
    });
  }


  return {
    bySubRegion: bySubRegion
  };
}]);
