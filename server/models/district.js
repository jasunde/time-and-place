var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var districtSchema = new Schema({
  type: {type: String, required: true},
  properties: {
    dist_num: {type: String},
    dist_label: {type: String}
  },
  geometry: {
    type: {type: String},
    coordinates: {type: [[[[Number]]]]}
  }
});

var District = mongoose.model('District', districtSchema);

module.exports = District;
