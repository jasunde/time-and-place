angular.module('reportApp')
  .controller('HowToController', function ($scope) {
    $scope.oneAtATime = true;
    $scope.status = {
      isCustomHeaderOpen: false,
      isFirstOpen: false,
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

