angular.module('reportApp')
.directive('dateInput', function () {
  return {
    replace: true,
    template: '<input type="range" />',
    restrict: 'E',
    // transclude: true,
    scope: {
      max: '=',
      min: '=',
      step: '=',
      value: '=',
      change: '&onChange'
    },
    link: function (scope, element, attrs, controllers) {
      var theAttrs = ['max', 'min', 'step', 'value'];

      scope.$watchGroup(theAttrs, setValues);

      function setValues(args) {
        if(areDefined(theAttrs)) {
          theAttrs.forEach(function (attr, i) {
            element.attr(attr, args[i]);
          });
        }
      }

      function areDefined(theAttrs) {
        return theAttrs.every(function (attr) {
          return angular.isDefined(scope[attr]);
        });
      }

      function read() {
        scope.value = parseInt(element.val());
      }

      element.on('change', function() {
        scope.$apply(read);
        scope.change();
      });
    }
  };
});
