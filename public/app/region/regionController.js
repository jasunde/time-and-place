// Interfaces with user and reports service
// knows what data wants to be displayed
// requests that data from reports service

angular.module('reportApp')
.controller('RegionController', ['$scope', 'Reports', 'Geo', function ($scope, Reports, Geo) {

  /**
   * Globals for RegionController
   */
    var path,
        projection;

  /**
   * GeoPaths using svg
   */
  $scope.geoData = [];

  var width = 960;
  var height = 600;

  var svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height);

  function groupBounds(paths) {
    var topLeft = undefined;
    var bottomRight = undefined;
    var bounds = [];
    paths.forEach(function (path) {
      bounds = d3.geoPath().bounds(path);
      if(typeof topLeft === 'undefined') {
        topLeft = bounds[0];
        bottomRight = bounds[1];
        console.log('only once.');
      } else {
        if(topLeft[0] > bounds[0][0]) {
          topLeft[0] = bounds[0][0];
        }
        if(topLeft[1] < bounds[0][1]) {
          topLeft[1] = bounds[0][1];
        }
        if(bottomRight[0] < bounds[1][0]) {
          bottomRight[0] = bounds[1][0];
        }
        if(bottomRight[1] > bounds[1][1]) {
          bottomRight[1] = bounds[1][1];
        }
      }
    });
    return [topLeft, bottomRight];
  }

  Geo.subRegions()
  .then(function (data) {
    $scope.geoData = Geo.data();
    path = d3.geoPath();

    projection = d3.geoConicEqualArea()
      .parallels([41.644073, 42.023683])
      .scale(70000)
      .translate([width/2,height/2])
      .rotate([87.73212559411209, 0])
      .center([0, 41.84449380686466]);

    path = d3.geoPath().projection(projection);
    svg.selectAll('path')
      .data($scope.geoData)
      .enter().append('path')
        .attr('stroke', 'magenta')
        .attr('fill', 'transparent')
        .attr('d', path);

  });

  var queryIdle = true,
      duration = moment.duration(1, 'month');

  /**
   * Data bound to $scope
   */
  // Region data from API
  $scope.subRegionHeirarchy = [
    'district',
    'beat',
    'block'
  ];
  $scope.dateFormat = 'dddd, MMMM Do YYYY';
  $scope.regionPath = [];
  $scope.timeFrame = {
    startMoment: moment().subtract(1, 'month'),
    endMoment: moment()
  };
  $scope.data = [];
  $scope.colOrder = '';
  $scope.totalReports = 0;
  $scope.startDate = new Date($scope.timeFrame.startMoment);
  $scope.timeSpan = 'month';

  // Initial getReports
  getReports();

  /**
   * Methods bound to $scope
   */
  // Change date with input
  $scope.changeStartDate = function () {
    $scope.timeFrame.startMoment = moment($scope.startDate);
    $scope.timeFrame.endMoment = $scope.timeFrame.startMoment.clone().add(duration);
    getReports();
  };

  // Change time span with radio buttons
  $scope.changeTimeSpan = function () {
    duration = moment.duration(1, $scope.timeSpan);
    $scope.timeFrame.endMoment = $scope.timeFrame.startMoment.clone().add(duration);
    $scope.endDate = new Date($scope.timeFrame.endDate);
    getReports();
  };

  // Re-order by column
  $scope.setOrder = function (column) {
    if($scope.colOrder === column) {
      $scope.colOrder = '-' + column;
    } else {
      $scope.colOrder = column;
    }
  };

  // Filter comparator for numbers stored as strings
  $scope.greaterThan = function (a, b) {
    a = parseInt(a.value); b = parseInt(b.value);
    var result = (a < b) ? -1 : 1;

    if( a === b ) {
      result = 0;
    }
    return result;
  };

  // Access sub-regions of a sub-region
  $scope.drillDown = function (region) {
    if(($scope.subRegionHeirarchy.length - 1) > $scope.regionPath.length && queryIdle) {
      $scope.regionPath.push(region.region);
      getReports();
    }
  };

  // Access region level up from current region
  $scope.climbUp = function (level) {
    if(level < $scope.regionPath.length && queryIdle) {
      $scope.regionPath = $scope.regionPath.slice(0, level);
      getReports();
    }
  };

  // TODO: find the limits of a set across time

  $scope.heatIndex = function(reports) {
    var range = Math.ceil( (((reports - Reports.min() + 1) / Reports.max()) ) * 10 );
    return 'heat' + range;
  };

  /**
   * Construct an object based on current timeFrame and regionPath
   * @return {Object} {timeframe, subRegion name, [region: type, id]}
   */
  function makeQueryObject() {
    // Assemble query information
    var query = {
      timeFrame: $scope.timeFrame,
      subRegion: $scope.subRegionHeirarchy[$scope.regionPath.length]
    };

    // Add region filter to query if exists
    if($scope.regionPath.length) {
      var regionNum = $scope.regionPath.length - 1;
      query.region = {
        type: $scope.subRegionHeirarchy[regionNum],
        id: $scope.regionPath[regionNum]
      };
    }
    return query;
  }

  // Get the crime numbers
  /**
   * Make request for new data by sub region
   * @return {void} Set new data from Reports factory
   */
  function getReports() {
    queryIdle = false;

    Reports.bySubRegion(makeQueryObject())
    .then(function () {
      queryIdle = true;
      $scope.data = Reports.subRegions();
      $scope.totalReports = Reports.total();
    });
  }
}]);
