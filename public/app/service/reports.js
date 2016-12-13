// Gets and stores data from the Chicago API about reports
angular.module('reportApp')
.factory('Reports', ['$http', function ReportsFactory($http) {

  var config = {};
  var subRegions = [];
  var minReports = 0;
  var maxReports = 0;
  var totalReports = 0;

  function getLimits(data) {
    minReports = getMin(data);
    maxReports = getMax(data);
  }

  function countReports(data) {
    return data.reduce(function(prev, row) {
      return prev + parseInt(row.reports);
    }, 0);
  }

  /**
   * update incoming data
   * @param  {array} data  array of sub-regions with count of crimes
   * @return void
   */
  function updateSubregions(data) {
    subRegions = data;
    if(subRegions.length === 0) {
      minreports = 0;
      maxreports = 0;
      totalReports = 0;
    } else {
      getLimits(subRegions);
      totalReports = countReports(subRegions);
    }
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

  /**
   * Query API based on query object
   * @param  {Object} query {timeframe, subRegion name, [region: type, id]}
   * @return {Promise}       [description]
   */
  function bySubRegion(query) {
    // set params
    config = {
      params: query
    };

    // send the request
    return $http.get('/reports', config)
    .then(function (response) {
      // only return the data
      updateSubregions(response.data);
    });
  }


  return {
    bySubRegion: bySubRegion,
    subRegions: function () {
      return subRegions;
    },
    max: function () {
      return maxReports;
    },
    min: function () {
      return minReports;
    },
    total: function () {
      return totalReports;
    }
  };
}]);
