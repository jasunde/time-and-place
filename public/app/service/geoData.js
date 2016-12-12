angular.module('reportApp')
.factory('GeoData', ['$http', function GeoDataFactory($http) {
  function subRegions(regionPath) {
    regionPath = regionPath || [];
    return $http.get('/geo')
      .then(function (response) {
        console.log(response);
      })
      .catch(function (err) {
        console.log('GET sub-region error:', err);
      });
  }

  return {
    subRegions: subRegions
  };
}]);
