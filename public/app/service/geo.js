angular.module('reportApp')
.factory('Geo', ['$http', function GeoFactory($http) {

  var data = [];

  function subRegions(regionPath) {
    regionPath = regionPath || [];
    return $http.get('/geo')
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
