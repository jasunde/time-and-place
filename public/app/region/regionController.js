// Interfaces with user and reports service
// knows what data wants to be displayed
// requests that data from reports service

angular.module('reportApp')
.controller('RegionController', ['$scope', 'Reports', 'Geo', function ($scope, Reports, Geo) {

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
    var path = d3.geoPath();

    var projection = d3.geoConicEqualArea()
      .parallels([41.644073, 42.023683])
      .scale(70000)
      .translate([width/2,height/2])
      .rotate([87.73212559411209, 0])
      .center([0, 41.84449380686466]);

    var path = d3.geoPath().projection(projection);
    svg.selectAll('path')
      .data($scope.geoData)
      .enter().append('path')
        .attr('stroke', 'magenta')
        .attr('fill', 'transparent')
        .attr('d', path);

  });

  // var d3Data = [4, 70, 15, 16, 23, 42];

  /**
   * Bar chart using svg
   */
  // var margin = {
  //       top: 20,
  //       right: 30,
  //       bottom: 30,
  //       left: 40
  //     },
  //     height = 500 - margin.top - margin.bottom,
  //     width = 900 - margin.right - margin.left;
  //
  // var y = d3.scaleLinear()
  //     .range([height, 0]);
  //
  // var x = d3.scaleBand()
  //     .rangeRound([0, width])
  //     .padding(.2);
  //
  // var xAxis = d3.axisBottom()
  //     .scale(x);
  //
  // var yAxis = d3.axisLeft()
  //     .scale(y)
  //     .ticks(7);
  //
  // var chart = d3.select('.chart')
  //     .attr('height', height + margin.top + margin.bottom)
  //     .attr('width', width + margin.right + margin.left)
  //   .append('g')
  //     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  //
  // d3.csv('data/d3Data.csv', type, function (err, data) {
  //   x.domain(data.map(function (d) { return d.name; }));
  //   y.domain([0, d3.max(data, function (d) { return d.value; })]);
  //
  //   var barWidth = width / data.length;
  //
  //   chart.append('g')
  //     .attr('class', 'x axis')
  //     .attr('transform', 'translate(0,' + height + ')')
  //     .call(xAxis);
  //
  //   chart.append('g')
  //     .attr('class', 'y axis')
  //     .call(yAxis);
  //
  //   chart.selectAll('.bar')
  //       .data(data)
  //     .enter().append('rect')
  //       .attr('class', 'bar')
  //       .attr('x', function (d) { return x(d.name); })
  //       .attr('y', function (d) { return y(d.value); })
  //       .attr('width', x.bandwidth())
  //       .attr('height', function (d) { return height - y(d.value); });

    // bar.append('text')
    //     .attr('x', x.bandwidth() / 2)
    //     .attr('y',  function (d) { return y(d.value) + 3; })
    //     .attr('dy', '.75em')
    //     .text(function (d) { return d.value; })
  // });

  // Coerce value to number
  function type(d) {
    d.value = +d.value
    return d;
  }
  /**
   * Bar chart using divs
   */
  // var x = d3.scaleLinear()
  //   .domain([0, d3.max(d3Data)])
  //   .range([0, 80]);
  //
  // d3.select('.chart')
  //   .selectAll('div')
  //     .data(d3Data)
  //   .enter().append('div')
  //     .style('width', function (d) { return x(d) + "%" })
  //     .text(function (d) { return d; });


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
