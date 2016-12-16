var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var beatSchema = new Schema({
  type: {type: String, required: true},
  properties: {
    beat_num: {type: String},
    beat_label: {type: String},
    id: {type: String},
    type: {type: String}
  },
  geometry: {
    type: {type: String},
    coordinates: {type: [[[[Number]]]]}
  }
});

var Beat = mongoose.model('Beat', beatSchema);

module.exports = Beat;
