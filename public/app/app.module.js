angular.module('reportApp', ['ngRoute', 'ui.bootstrap'])
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
