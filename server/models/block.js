var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blockSchema = new Schema({
  type: {type: String, required: true},
  properties: {
    blockce10: {type: String},
    name10: {type: String},
    id: {type: String},
    type: {type: String}
  },
  geometry: {
    type: {type: String},
    coordinates: {type: [[[[Number]]]]}
  }
});

var Block = mongoose.model('Block', blockSchema);

module.exports = Block;
