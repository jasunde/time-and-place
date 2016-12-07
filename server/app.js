var express = require('express');
var app = express();
var path = require('path');
var reports = require('./routes/reports');

app.set('port', process.env.PORT || 3000);

app.get('/', function functionName(req, res) {
  res.sendFile(path.join(__dirname , '../public'));
});

app.use(express.static('./public'));

// Crime incident report Data
app.use('/reports', reports);

app.listen(app.get('port'), function () {
  console.log('Listening on port ' + app.get('port') + '...');
});
