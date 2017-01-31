angular.module('reportApp')
  .controller('HowToController', function ($scope) {
    $scope.oneAtATime = true;
    $scope.status = {
      isCustomHeaderOpen: false,
      isFirstOpen: true,
      isFirstDisabled: false
    };
  })
  .directive('howTo', function() {
    return {
      controller: 'HowToController',
      templateUrl: 'app/directives/howTo.html',
      restrict: 'E'
    };
  });

