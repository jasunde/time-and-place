angular.module('reportApp')
.controller('RegionController', ['$scope', 'Data', function ($scope, Data) {
  // Region nesting:
  // city > community_area

  var minReports = 0,
      maxReports = 0,
      regionDepth = 3,
      regionPath = [],
      queryIdle = true;

  $scope.data = [];
  $scope.order = '';
  $scope.limits = {};
  $scope.totalReports = 0;
  $scope.setOrder = function (column) {
    if($scope.order === column) {
      $scope.order = '-' + column;
    } else {
      $scope.order = column;
    }
  };

  $scope.greaterThan = function (a, b) {
    a = parseInt(a.value); b = parseInt(b.value);
    var result = (a < b) ? -1 : 1;

    if( a === b ) {
      result = 0;
    }
    return result;
  }

  $scope.drillDown = function (row) {
    if(regionDepth > regionPath.length + 1 && queryIdle) {
      regionPath.push(row.region)
      getReports();
    }
  }

  $scope.climbUp = function () {
    if(regionPath.length > 0 && queryIdle) {
      regionPath.pop();
      getReports();
    }
  }

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
  }

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
    Data.reportsByRegion(regionPath)
    .then(function (result) {
      queryIdle = true;
      updateData(result.data);
      console.log(result);
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
