// Interfaces with user and reports service
// knows what data wants to be displayed
// requests that data from reports service

angular.module('reportApp')
.controller('RegionController', 
  ['$scope', 'Reports', 'Geo', '$q', '$window', '$document',
  function ($scope, Reports, Geo, $q, $window, $document) {

  /**
   * Globals for RegionController
   */
  var d3Reports = d3.map(),
      path = d3.geoPath(),
      // map margin
      m = 20,
      mapTop = 63,
      mapRight = 75,
			mapBottom = 63,
      map,
      width, height;


  var projection = d3.geoConicEqualArea()
      .parallels([41.644073, 42.023683])
      .scale(70000)
      .translate([width/2,height/2])
      .rotate([87.73212559411209, 0])
      .center([0, 41.84449380686466]);

  function mapDimensions() {
    width = document.querySelector('.report-map').clientWidth;
    height = $window.innerHeight;

    map = d3.select('#map')
      .attr('width', width)
      .attr('height', height);
  }

  var t = d3.transition()
      .duration(250)
      .ease(d3.easeLinear);

  $window.addEventListener('resize', function () {
    mapDimensions();

    updateMap();
  });

  /**
   * GeoPaths using svg
   */
  $scope.geoData = [];

  var color = d3.scaleSequential(d3.interpolateYlOrRd);

  var chart = d3.select('.chart');

  var mask = d3.select('mask');

  /**
   * Find the total outer bounds of an array of geoJSON features
   *
   * @param {array} paths geoJSON features
   * @returns {geoJSON} geoJSON feature describing outer bounds of the array of features
   */
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
  $scope.startDate = +$scope.timeFrame.startMoment;
  $scope.minDate = +moment('2001-01-01');
  $scope.maxDate = +moment();
  $scope.dateStep = duration.as('milliseconds');
  $scope.timeSpan = 'month';
  $scope.years = [];

  for (var i = 2001, year = moment().year(); i <= year; i++) {
    var milliseconds = +moment(i + '-01-01');
    $scope.years.push({
      number: i,
      milliseconds: milliseconds
    });
  }
    console.log('years', $scope.years);

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
  $scope.changeStartDate = function() {
    $scope.timeFrame.startMoment = moment($scope.startDate);
    $scope.timeFrame.endMoment = $scope.timeFrame.startMoment.clone().add(duration);
    getReports().then(function () {
      updateMap();
    });
  }

  $scope.changeStart = function () {
    console.log($scope.numDate);
  };

  // Change time span with radio buttons
  $scope.$watch('timeSpan', changeTimeSpan);
  function changeTimeSpan() {
    duration = moment.duration(1, $scope.timeSpan);
    $scope.timeFrame.endMoment = $scope.timeFrame.startMoment.clone().add(duration);
    $scope.endDate = new Date($scope.timeFrame.endDate);
    $scope.dateStep = duration.as('milliseconds');
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

  /**
   * Move down to one region finer granularity of data
   *
   * @param {object} region Region with id and number of reports
   */
  function drillDown(region) {
    if(($scope.subRegionHeirarchy.length - 1) > $scope.regionPath.length && queryIdle) {
      $scope.regionPath.push(region.region);
      $q.all([
        getMap(),
        getReports()
      ]).then(function (promiseHash) {
        updateMap(true);
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
        updateMap(true);
      });
    }
  };

  // TODO: find the limits of a set across time

  $scope.heatIndex = heatIndex;

  function heatIndex(reports) {
    var range = reportRate(reports);
    return 'heat' + range;
  }

  function reportRate(reports) {
    return  Math.ceil((reports - Reports.min()) / (Reports.max() - Reports.min()) * 10);
  }

  function datePercentage(startDate) {
    var begin = moment('2001-01-01');
    var percent = (+startDate - +begin) / (+moment() - +begin);
    console.log(percent, $scope.maxDate);
    return Math.floor(percent * $scope.maxDate);
  }

  /**
   * Get the current sub-region type
   *
   * @returns {undefined}
   */
  function getSubRegionType() {
    return $scope.subRegionHeirarchy[$scope.regionPath.length];
  }

  /**
   * Get the current region type
   *
   * @returns {String}
   */
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

  /**
   * Return the color for a region
   *
   * @param region
   * @returns {String}
   */
  function getRegionColor(region) {
    return color(d3Reports.get(region.properties.id));
  }

  /**
   * Get the geoJSON for the current parent region
   *
   * @param {string} id id of the current parent region
   * @returns {geoJSON} geoJSON for current parent region
   */
  function getRegionMap(id) {
    var regionMaps = $scope.geoData[getRegionType()];
    return regionMaps.find(function (region) {
      return region.properties.id === id;
    });
  }

  function drawColorLegend() {
    var scale = d3.scaleLinear()
      .domain([Reports.min(), Reports.max()])
      .range([$window.innerHeight / 8, $window.innerHeight / 2]);

    var axis = d3.axisRight(scale);

    d3.selectAll('.color-legend').remove();

    map.append('g')
      .attr('class', 'color-legend')
      .attr('transform', 'translate('+ (map.attr("width") - mapRight)+', 0)')
      .call(axis);

    d3.selectAll('#colorLegend').remove();

    var colors = [];
    for (var i = 1, len = 11; i < len; i++) {
      colors.push(color(
        (Reports.max() - Reports.min()) * i / 10 + Reports.min()
      ));
    }
    console.log('colors', colors);

    map.select('defs')
    .append('linearGradient')
      .attr('id', 'colorLegend')
      .selectAll('stop')
        .data(colors)
      .enter().append('stop')
        .attr('offset', function (d, i) {
          return (i / colors.length * 100) + '%';
        })
        .attr('stop-color', function (d) {
          return d;
        });

    var legend = d3.select('.color-legend');

    legend.append('rect')
      .attr('height', 8)
      .attr('width', scale.range()[1] - scale.range()[0])
      .attr('x', scale.range()[0])
      .attr('transform', 'rotate(90)')
      .attr('fill', 'url(#colorLegend)');

    var legendMiddle = scale.range()[0] + ((scale.range()[1] - scale.range()[0]) / 2);

      legend.append('text')
      .attr('class', 'caption')
      // .attr('x', legendMiddle)
      .attr('x', scale.range()[0])
      .attr('y', -40)
      .attr('fill', '#000')
      .attr('transform', 'rotate(90)')
      .text('Number of reports');
  }

  /*
   * Update the map with the current state
   *
   * @param {boolean} mapChange True for change in map region
   */
  function updateMap(mapChange) {
    var parentRegion;
    var subRegion = getSubRegionType();
    var region = getRegionType();

    var data = $scope.geoData[subRegion];

    if($scope.regionPath.length) {
      parentRegion = getRegionMap($scope.regionPath[$scope.regionPath.length - 1]);
    } else {
      parentRegion = groupBounds(data);
    }

    projection.fitExtent([[m, mapTop + m],[width - mapRight - m, height - mapBottom - m]], parentRegion);
    path = d3.geoPath().projection(projection);

    if(mapChange) {
      chart.selectAll('path').remove();
    }
    var maps = chart.selectAll('path')
      .data(data);

    // Update
    maps
      .transition(t)
        .attr('fill', function(d) { return getRegionColor(d); })
        .attr('d', path);

    // Enter
    maps
      .enter().append('path')
          .on('click', function (d, i) { drillDown({
            region: d.properties.id
          }); })
          .attr('opacity', 0)
        .transition(t)
          .attr('fill', function(d) { return getRegionColor(d); })
          .attr('d', path)
          .attr('opacity', 1);

    // Exit
    maps
      .exit()
      .transition(t)
        .attr('opacity', 0)
      .remove();

    drawColorLegend();

    mask.selectAll('path').remove();

    mask.selectAll('path')
    .data([parentRegion])
    .enter().append('path')
    .attr('fill', '#ffffff')
    .attr('d', path);
  }

  /**
   * Get the geoJSON for the current state
   *
   */
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
      mapDimensions();
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

      // Set min and max for dataset
      color.domain([Reports.min(), Reports.max()]);

      // console.log(color.domain(), color.range(), color(Reports.min()));
      $scope.reportData = Reports.subRegions();
      $scope.totalReports = Reports.total();
    });
  }
}]);
