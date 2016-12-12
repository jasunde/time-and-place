// Interfaces with user and reports service
// knows what data wants to be displayed
// requests that data from reports service

angular.module('reportApp')
.controller('RegionController', ['$scope', 'Reports', function ($scope, Reports) {
  // Region nesting:
  // city > police district > police beat > block

  var minReports = 0,
      maxReports = 0,
      queryIdle = true,
      duration = moment.duration(1, 'month');

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

  getReports();

  /**
   * Update incoming data
   * @param  {Array} data  Array of sub-regions with count of crimes
   * @return void
   */
  function updateSubRegions(data) {
    $scope.data = data;
    if(data.length === 0) {
      minReports = 0;
      maxReports = 0;
      $scope.totalReports = 0;
    } else {
      getLimits($scope.data);
      $scope.totalReports = countReports(data);
    }
  }

  // TODO: find the limits of a set across time

  function getLimits(data) {
    minReports = getMin(data);
    maxReports = getMax(data);
  }

  $scope.heatIndex = function(reports) {
    var range = Math.ceil( (((reports - minReports + 1) / maxReports) ) * 10 );
    return 'heat' + range;
  };

  /**
   * Get the minimum value in the set
   * @param  {Array} data  Array of regions with count of crimes
   * @return {Integer}     Smallest number of crimes within the set
   */
  function getMin(data) {
    return data.reduce(function(previous, data) {
      if(!previous) {
        previous = data.reports;
      }
      return Math.min(previous, data.reports);
    });
  }

  /**
   * Get the maximum value in the set
   * @param  {Array} data  Array of regions with count of crimes
   * @return {Integer}     Largest number of crimes within the set
   */
  function getMax(data) {
    return data.reduce(function(previous, data) {
      if(!previous) {
        previous = data.reports;
      }
      return Math.max(previous, data.reports);
    });
  }

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
  function getReports() {
    queryIdle = false;

    Reports.bySubRegion(makeQueryObject())
    .then(function (subRegionData) {
      queryIdle = true;
      updateSubRegions(subRegionData);
    });
  }

  function countReports(data) {
    return data.reduce(function(prev, row) {
      return prev + parseInt(row.reports);
    }, 0);
  }

  // Get the community area info
//   Data.query('community_area', 'SELECT area_num_1, community')
//   .then(function (result) {
//     // console.log(result.data);
//     result.data.forEach(function(community_area) {
//       $scope.community_names[community_area.area_num_1] = community_area.community;
//     });
//
//   });
}]);
