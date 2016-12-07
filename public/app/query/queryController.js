angular.module('reportApp')
.controller('QueryController', ['$scope', 'Data', function ($scope, Data) {
  // Region nesting:
  // city > community_area

  var minReports = 0,
      maxReports = 0;

  $scope.data = [];
  $scope.columns = [];
  $scope.order = '';
  $scope.community_names = [];
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

  /**
   * Update incoming data
   * @param  {Array} data  Array of regions with count of crimes
   * @return {[type]}      [description]
   */
  function updateData(data) {
    $scope.data = filterData(data);
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
    return data.reduce(function(previous, {reports: reports}) {
      if(!previous) {
        previous = reports;
      }
      return Math.min(previous, reports);
    });
  }

  /**
   * Get the maximum value in the set
   * @param  {Array} data  Array of regions with count of crimes
   * @return {Integer}     Largest number of crimes within the set
   */
  function getMax(data) {
    return data.reduce(function(previous, {reports: reports}) {
      if(!previous) {
        previous = reports;
      }
      return Math.max(previous, reports);
    });
  }
  /**
   * Filter bad data
   * @param  {Array} data  Array of regions with count of crimes
   * @return {Array}       Filtered array
   */
  function filterData(data) {
    return data.filter(function(data) {
      return data.community_area != 0 && typeof data.community_area !== 'undefined';
    });
  }

  // Get the crime numbers
  Data.query('crime', 'SELECT community_area, COUNT(*) AS reports GROUP BY community_area')
  .then(function (result) {
    updateData(result.data);
  });

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
