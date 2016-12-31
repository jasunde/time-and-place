angular.module('reportApp')
.directive('dateInput', function () {
  return {
    replace: false,
    // template: '<input type="range" />',
    templateUrl: 'app/directives/dateInput.html',
    restrict: 'E',
    // transclude: true,
    scope: {
      max: '=',
      min: '=',
      step: '=',
      value: '=',
      change: '&onChange',
      class: '='
    },
    link: function (scope, element, attrs, controllers) {
      var theAttrs = ['max', 'min', 'step', 'value', 'class'];
      var input = element.find('input');
			console.log('input', input);
			var d3El = d3.select(element[0]);
      var svg = d3El.select('svg');
      var div = element.find('div');

      var timeLine = d3.scaleTime().domain([new Date(2001, 0, 1, 0), new Date()]);

      inputDimensions();

      function inputDimensions() {
        svg.attr('width', input[0].clientWidth - input[0].clientHeight);
        svg.attr('height', input[0].clientHeight * 2);
        timeLine
          .range([0,svg.attr('width')])
          .tickFormat(d3.timeYear.every(1), d3.timeFormat("%Y"));
          // .tickFormat(d3.timeFormat("%Y"));
				drawTrack();
      }

      function drawTrack() {
        var axis = d3.axisBottom(timeLine);
				svg.select('.time-scale').remove();

        svg.append('g')
        .attr('class', 'time-scale')
        .attr('transform', 'translate('+input[0].clientHeight / 2+','+input[0].clientHeight / 2+')')
        .call(axis);
      }

      window.addEventListener('resize', inputDimensions);

      scope.$watchGroup(theAttrs, setValues);

      function setValues(args) {
        if(areDefined(theAttrs)) {
          theAttrs.forEach(function (attr, i) {
            input.attr(attr, args[i]);
            if(attr === 'class') {
              svg.attr(attr, args[i]);
              div.attr(attr, args[i]);
            }
          });
        }
      }

      function areDefined(theAttrs) {
        return theAttrs.every(function (attr) {
          return angular.isDefined(scope[attr]);
        });
      }

      function read() {
        scope.value = parseInt(input.val());
      }

      input.on('change', function() {
        scope.$apply(read);
        scope.change();
      });
    }
  };
});
