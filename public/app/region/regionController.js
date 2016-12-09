angular.module('reportApp')
.controller('RegionController', ['$scope', 'Reports', function ($scope, Reports) {
  // Region nesting:
  // city > police district > police beat > block

  var minReports = 0,
      maxReports = 0,
      regionDepth = 3,
      queryIdle = true,
      timeSpanMoment = moment.duration(1, 'month');


  // Region data from API
  $scope.dateFormat = 'dddd, MMMM Do YYYY',
  $scope.regionPath = [],
  $scope.timeFrame = {
    startMoment: moment().subtract(timeSpanMoment),
    endMoment: moment()
  };
  $scope.data = [];
  $scope.order = '';
  $scope.limits = {};
  $scope.totalReports = 0;
  $scope.startDate = new Date($scope.timeFrame.startMoment);
  $scope.timeSpan = 'month';

  // Change date with input
  $scope.changeStartDate = function () {
    $scope.timeFrame.startMoment = moment($scope.startDate);
    $scope.timeFrame.endMoment = $scope.timeFrame.startMoment.clone().add(timeSpanMoment);
    getReports();
  }

  // Change time span with radio buttons
  $scope.changeTimeSpan = function () {
    timeSpanMoment = moment.duration(1, $scope.timeSpan);
    $scope.timeFrame.endMoment = $scope.timeFrame.startMoment.clone().add(timeSpanMoment);
    $scope.endDate = new Date($scope.timeFrame.endDate);
    getReports();
  }

  // Re-order by column
  $scope.setOrder = function (column) {
    if($scope.order === column) {
      $scope.order = '-' + column;
    } else {
      $scope.order = column;
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
    if(regionDepth > $scope.regionPath.length + 1 && queryIdle) {
      $scope.regionPath.push(region.region);
      getReports();
    }
  };

  // Access region one level up from current region
  $scope.climbUp = function () {
    if($scope.regionPath.length > 0 && queryIdle) {
      $scope.regionPath.pop();
      getReports();
    }
  };

  getReports();

  /**
   * Update incoming data
   * @param  {Array} data  Array of regions with count of crimes
   * @return {[type]}      [description]
   */
  function updateData(data) {
    $scope.data = data;
    $scope.limits = getLimits($scope.data);
    $scope.totalReports = countReports(data);
  }

  // TODO: find the limits of a set across time

  function getLimits(data) {
    minReports = getMin(data);
    maxReports = getMax(data);
    console.log(minReports, maxReports);
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

  // Get the crime numbers
  function getReports() {
    queryIdle = false;
    console.log($scope.timeFrame);
    Reports.byRegion($scope.regionPath, $scope.timeFrame)
    .then(function (result) {
      queryIdle = true;
      console.log(result);
      updateData(result.data);
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
