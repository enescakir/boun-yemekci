var express = require('express');
var app = express();
var processor = require('./helpers/processor');
var bot = require('./helpers/yemekciBot');
var constants = require('./constants/fileConstants');
var redis = require('redis');
var client = redis.createClient();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, res) {
  res.setHeader('Content-Type', 'application/json');
  processor.getJSONMonthlyYemekList(function(data) {
    res.send(data);
  });
});

app.get('/import', function(request, res) {
  res.setHeader('Content-Type', 'application/json');
  processor.getJSONMonthlyYemekList(function(data) {
    data = JSON.parse(data)
    Object.keys(data).forEach(function(key,index) {
      client.set(key, JSON.stringify(data[key]));
      console.log(key + " saved")
    });
    res.send("Success");
  });
});

app.get('/send/lunch', function(request, res) {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; // getMonth() is zero-based
  var yyyy = today.getFullYear();
  var key = [(dd>9 ? '' : '0') + dd, (mm>9 ? '' : '0') + mm, yyyy].join('/');

  client.get(key, function(err, yemekJson) {
    yemekObject = JSON.parse(yemekJson)
    var lunch = yemekObject[constants.LUNCH_IDENTIFIER];
    bot.sendLunch(lunch);
    res.send(lunch);
  });
});

app.get('/send/dinner', function(request, res) {
  var today = new Date();
  bot.sendDinner(today);
});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
