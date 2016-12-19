// Interfaces with user and reports service
// knows what data wants to be displayed
// requests that data from reports service

angular.module('reportApp')
.controller('RegionController', ['$scope', 'Reports', 'Geo', '$q', '$window', '$document', function ($scope, Reports, Geo, $q, $window, $document) {

  /**
   * Globals for RegionController
   */
  var path,
      cityProjection,
      projection,
      d3Reports = d3.map(),
      // map margin
      m = 20,
      svg;

  $window.addEventListener('resize', function () {
    width = $window.innerWidth;
    height = $window.innerHeight;

    svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height);

    updateMap();
  });

  /**
   * GeoPaths using svg
   */
  $scope.geoData = [];

  console.log($window);

  var width = $window.innerWidth;
  var height = $window.innerHeight;
  var cityBounds = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [42.032719, -87.947080],
          [42.032719, -87.516810],
          [41.639781, -87.516810],
          [41.639781, -87.947080],
          [42.032719, -87.947080]
        ]
      ]
    }
  };
  

  var color = d3.scaleThreshold()
    .domain(d3.range(2,10))
    .range(d3.schemeBlues[9]);


  svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height);

  var chart = d3.select('.chart');

  var mask = d3.select('mask');

  function groupBounds(paths) {
    var topLeft;
    var bottomRight;
    var bounds = [];
    // TODO: Figure out why bounds aren't as expected
    paths.forEach(function (path) {
      bounds = d3.geoPath().bounds(path);
      if(typeof topLeft === 'undefined') {
        topLeft = bounds[0];
        bottomRight = bounds[1];
      } else {
        topLeft[0] = Math.min(topLeft[0], bounds[0][0] - 0.006);
        topLeft[1] = Math.max(topLeft[1], bounds[0][1] + 0.035);
        bottomRight[0] = Math.max(bottomRight[0], bounds[1][0] + 0.006);
        bottomRight[1] = Math.min(bottomRight[1], bounds[1][1] - 0.058);
      }
    });

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          topLeft,
          [bottomRight[0],topLeft[1]],
          bottomRight,
          [topLeft[0],bottomRight[1]],
          topLeft
        ]]
      }
    };
  }

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
  $scope.dateFormat = 'MMMM Do YYYY';
  $scope.regionPath = [];
  $scope.timeFrame = {
    startMoment: moment().subtract(1, 'month'),
    endMoment: moment()
  };
  $scope.reportData = [];
  $scope.colOrder = '';
  $scope.totalReports = 0;
  $scope.startDate = new Date($scope.timeFrame.startMoment);
  $scope.timeSpan = 'month';

  // Initial getReports
  $q.all([
    getMap(),
    getReports()
  ]).then(function (promiseHash) {
    updateMap();
  });

  /**
   * Methods bound to $scope
   */
  // Change date with input
  $scope.changeStartDate = function () {
    $scope.timeFrame.startMoment = moment($scope.startDate);
    $scope.timeFrame.endMoment = $scope.timeFrame.startMoment.clone().add(duration);
    getReports().then(function () {
      updateMap();
    });
  };

  // Change time span with radio buttons
  $scope.changeTimeSpan = function () {
    duration = moment.duration(1, $scope.timeSpan);
    $scope.timeFrame.endMoment = $scope.timeFrame.startMoment.clone().add(duration);
    $scope.endDate = new Date($scope.timeFrame.endDate);
    getReports().then(function () {
      updateMap();
    });
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
  $scope.drillDown = drillDown;

  function drillDown(region) {
    if(($scope.subRegionHeirarchy.length - 1) > $scope.regionPath.length && queryIdle) {
      $scope.regionPath.push(region.region);
      $q.all([
        getMap(),
        getReports()
      ]).then(function (promiseHash) {
        console.log(promiseHash);
        updateMap();
      });
    }
  }

  // Access region level up from current region
  $scope.climbUp = function (level) {
    if(level < $scope.regionPath.length && queryIdle) {
      $scope.regionPath = $scope.regionPath.slice(0, level);
      $q.all([
        getMap(),
        getReports()
      ]).then(function (promiseHash) {
        console.log(promiseHash);
        updateMap();
      });
    }
  };

  // TODO: find the limits of a set across time

  $scope.heatIndex = heatIndex;

  function heatIndex(reports) {
    var range = reportRate(reports);
    return 'heat' + range;
  }

  // TODO: something is wrong with reportRate...
  function reportRate(reports) {
    return Math.ceil( (((reports - Reports.min() + 1) / Reports.max()) ) * 10 );
  }

  function getSubRegionType() {
    return $scope.subRegionHeirarchy[$scope.regionPath.length];
  }

  function getRegionType() {
    var type;
    if($scope.regionPath.length) {
      type = $scope.subRegionHeirarchy[$scope.regionPath.length - 1];
    } else {
      type = 'city';
    }
    return type;
  }

  /**
   * Construct an object based on current timeFrame and regionPath
   * @return {Object} {timeframe, subRegion name, [region: type, id]}
   */
  function makeQueryObject() {
    // Assemble query information
    var query = {
      timeFrame: $scope.timeFrame,
      subRegion: getSubRegionType()
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

  function getRegionColor(data) {
    return color(reportRate(d3Reports.get(data.properties.id)));
  }

  function getRegionMap(id) {
    var regionMaps = $scope.geoData[getRegionType()];
    return regionMaps.find(function (region) {
      return region.properties.id === id;
    });
  }

  function updateMap() {
    var parentRegion;
    var subRegion = getSubRegionType();

    var data = $scope.geoData[subRegion];

    if($scope.regionPath.length) {
      parentRegion = getRegionMap($scope.regionPath[$scope.regionPath.length - 1]);
      projection.fitExtent([[m, m],[width - m, height - m]], parentRegion);
      path = d3.geoPath().projection(projection);

    } else {
      parentRegion = groupBounds(data);

      projection.fitExtent([[m, m],[width - m, height - m]], parentRegion);
      path = d3.geoPath().projection(projection);
    }

    chart.selectAll('path').remove();
    chart.selectAll('path')
      .data(data)
        .attr('fill', function(d) { return getRegionColor(d); })
      .enter().append('path')
          .on('click', function (d, i) { drillDown({
            region: d.properties.id
          }); })
          .attr('fill', function(d) { return getRegionColor(d); })
          .attr('d', path)
      .exit().remove();

    mask.selectAll('path').remove();

    if($scope.regionPath.length) {
      mask.selectAll('path')
      .data([parentRegion])
      .enter().append('path')
      .attr('fill', '#ffffff')
      .attr('d', path);
    } else {
      mask.selectAll('path')
      .data([parentRegion])
      .enter().append('path')
      .attr('fill', '#ffffff')
      .attr('d', path);
    }
  }

  function getMap() {
    var type = 'city',
        regionId = 0;

    if($scope.regionPath.length) {
      type = $scope.subRegionHeirarchy[$scope.regionPath.length - 1];
      regionId = $scope.regionPath[$scope.regionPath.length - 1];
    }

    var query = {
      type: type,
      id: regionId
    };

    return Geo.subRegions(query)
    .then(function (data) {

      $scope.geoData[getSubRegionType()] = Geo.data();
      path = d3.geoPath();

      projection = d3.geoConicEqualArea()
      .parallels([41.644073, 42.023683])
      .scale(70000)
      .translate([width/2,height/2])
      .rotate([87.73212559411209, 0])
      .center([0, 41.84449380686466]);

      cityProjection = projection;

      path = d3.geoPath().projection(cityProjection);
    });
  }



  // Get the crime numbers
  /**
   * Make request for new data by sub region
   * @return {void} Set new data from Reports factory
   */
  function getReports() {
    queryIdle = false;

    return Reports.bySubRegion(makeQueryObject())
    .then(function () {
      queryIdle = true;
      d3Reports.clear();
      Reports.subRegions().forEach(function (d){ d3Reports.set(d.region, +d.reports); });
      $scope.reportData = Reports.subRegions();
      $scope.totalReports = Reports.total();
    });
  }
}]);
