angular.module('reportApp')
.controller('RegionController', ['$scope', 'Data', function ($scope, Data) {
  // Region nesting:
  // city > community_area

  var minReports = 0,
      maxReports = 0,
      regionPath = [];

  $scope.data = [];
  $scope.order = '';
  $scope.limits = {};

  $scope.list = '';
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
    regionPath.push(row.region)
    getReports();
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
  }

  // TODO: find the limits of a set across time

  function getLimits(data) {
    minReports = getMin(data);
    maxReports = getMax(data);
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
    Data.query(regionPath)
    .then(function (result) {
      updateData(result.data);
      console.log(result);
    });
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
