angular.module('reportApp', ['ngRoute'])
.config(function ($routeProvider) {
  $routeProvider
  .when('/query', {
    templateUrl: 'app/query/queryView.html',
    controller: 'QueryController'
  })
  .otherwise({
    redirectTo: '/query'
  });
});
