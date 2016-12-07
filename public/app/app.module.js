angular.module('reportApp', ['ngRoute'])
.config(function ($routeProvider) {
  $routeProvider
  .when('/region', {
    templateUrl: 'app/region/regionView.html',
    controller: 'RegionController'
  })
  .otherwise({
    redirectTo: '/region'
  });
});
