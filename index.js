var express = require('express');
var app = express();
var processor = require('./helpers/processor');
var bot = require('./helpers/yemekciBot');
var Sender = require('./helpers/sender');
var constants = require('./constants/fileConstants');
var redis = require('redis');
var schedule = require('node-schedule');
var dotenv = require('dotenv').config();

var client = redis.createClient();
var sender = new Sender({
  bot
});

app.set('port', (process.env.PORT || 5000));

// every day at 11.00
schedule.scheduleJob("0 0 11 * * *", function() {
  sender.sendLunch();
});

// every day at 17.00
schedule.scheduleJob("0 0 16 * * *", function() {
  sender.sendDinner();
});

bot.listenSlackMessages();

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
