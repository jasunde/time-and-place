angular.module('reportApp')
.factory('GeoData', ['$http', function GeoDataFactory($http) {
  function subRegionsOf(region) {
    return $http('/geo/' + region)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (err) {
        console.log('GET sub-region error:', err);
      });
  }

  return {
    subRegionsOf: subRegionsOf
  };
}]);
