var express = require('express');
var app = express();
var processor = require('./helpers/processor');
var bot = require('./helpers/yemekciBot');
var Sender = require('./helpers/sender');
var constants = require('./constants/fileConstants');
var redis = require('redis');
var schedule = require('node-schedule');
var dotenv = require('dotenv').config();
var Importer = require('./crons/import');

var client = redis.createClient();

var sender = new Sender({
  bot
});

var importer = new Importer({
  processor,
  client
})

app.set('port', (process.env.PORT || 5000));

app.get('/:day/:month/:year', function(req, res) {
  var dd = req.params.day;
  var mm = req.params.month;
  var yyyy = req.params.year;

  var key = [(dd > 9 ? "" : "0") + dd, (mm > 9 ? "" : "0") + mm, yyyy].join("/");

  client.get(key, function(err, yemekJson) {
    if (!yemekJson) {
      var possibleKey = [(dd > 9 ? "" : "0") + dd, (mm > 9 ? "" : "0") + mm, yyyy].join("."); // fix for dot
      client.get(possibleKey, function(err, possibleYemekJson) {
        if (!possibleYemekJson) {
          res.status(404).json({
            error: "Yemek bulunamadı"
          });
        } else {
          yemekObject = JSON.parse(possibleYemekJson);
          res.json(yemekObject);
        }
      });
    } else {
      yemekObject = JSON.parse(yemekJson);
      res.json(yemekObject);
    }
  });
});

// every day at 11.00
schedule.scheduleJob("0 0 11 * * *", function() {
  sender.sendLunch();
});

// every day at 17.00
schedule.scheduleJob("0 0 16 * * *", function() {
  sender.sendDinner();
});

// imports new foods to redis at every month's 1st day at 06.00
schedule.scheduleJob("0 0 6 1 * *", function() {
  importer.importToRedis();
});

bot.listenSlackMessages();

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
