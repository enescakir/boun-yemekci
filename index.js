var express = require('express');
var app = express();
var processor = require('./helpers/processor');
var bot = require('./helpers/yemekciBot');
var constants = require('./constants/fileConstants');
var redis = require('redis');
var schedule = require('node-schedule');

// var j = schedule.scheduleJob('*/3 * * * * *', function(){
//   console.log('The answer to life, the universe, and everything!');
// });

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
    res.send(data);
  });
});

app.get('/send/lunch', function(request, res) {
  var today = new Date();
  bot.sendLunch(today, function() {
    res.send(today);
  });
});

app.get('/send/dinner', function(request, res) {
  var today = new Date();
  bot.sendDinner(today, function success() {
    res.send("Today's dinner is sent!");
  }, function() {
    res.send("couldn't send!");
  });

});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
