angular.module('reportApp')
.factory('Geo', ['$http', function GeoFactory($http) {

  var data = [];

  function subRegions(query) {
    var config = {
      params: query
    };

    return $http.get('/geo', config)
      .then(function (response) {
        data = response.data;
      })
      .catch(function (err) {
        console.log('GET sub-region error:', err);
      });
  }

  return {
    subRegions: subRegions,
    data: function () {
      return data;
    }
  };
}]);
