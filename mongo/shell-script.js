var conn = new Mongo();
db = conn.getDB('timeAndPlace');

// db.crimes.aggregate( [ {$limit: 10000}, { $group: { _id: "$Block", lat: {$first: "$Latitude"}, lng: {$first: "$Longitude"} } } ], {allowDiskUse: true})

db.uniqueBlocks.find().forEach(function (doc1) {
  db.blocks.find( {
    "geometry": {
      $geoIntersects: {
        $geometry: {
          type: 'Point', coordinates: [doc1.lng, doc1.lat]
        }
      }
    }
  }).forEach(function (doc2) {
    if(doc2 != null) {
      doc2.properties.block_name = doc1._id;
      db.blocks.save(doc2);
    }
  });
});
