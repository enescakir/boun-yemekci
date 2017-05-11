var express = require('express');
var app = express();
var processor = require('./helpers/processor');
var bot = require('./helpers/yemekciBot');
var constants = require('./constants/fileConstants');
var redis = require('redis');
var schedule = require('node-schedule');
var dotenv = require('dotenv').config();

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

bot.listenSlackMessages();
// app.get('/:day/:month/:year/lunch', function(request, res) {
//   var today = new Date();
//   bot.sendLunch(today);
//   res.send("gönderildi");
// });
//
// app.get('/:day/:month/:year/dinner', function(request, res) {
//   var today = new Date();
//   bot.sendDinner(today);
//   res.send("gönderildi");
//
// });


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
