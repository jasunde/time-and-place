var express = require('express');
var app = express();
var path = require('path');
var mongoConnection = require('./modules/mongoConnection');
var reports = require('./routes/reports');
var geo = require('./routes/geo');

app.set('port', process.env.PORT || 3000);

app.get('/', function functionName(req, res) {
  res.sendFile(path.join(__dirname , '../public'));
});

app.use(express.static('./public'));

// Crime incident report Data
app.use('/reports', reports);
app.use('/geo', geo);

app.listen(app.get('port'), function () {
  console.log('Listening on port ' + app.get('port') + '...');
});
