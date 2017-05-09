var SlackBot = require('slackbots');
var processor = require('../helpers/processor');
var constants = require('../constants/fileConstants');
var redis = require('redis');
var dotenv = require('dotenv').config()
var client = redis.createClient();
var Twitter = require('twit');

var bot = new SlackBot({
    token: process.env.BOT_TOKEN,
    name: process.env.BOT_NAME,
});

var twitter = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// twitter.post('statuses/update', { status: message }, function(err, data, response) {
//   // console.log(data)
// })

var channel = process.env.BOT_CHANNEL;

function getYemek(date, onSuccess, onError) {
  var dd = date.getDate();
  var mm = date.getMonth() + 1; // getMonth() is zero-based
  var yyyy = date.getFullYear();
  var key = [(dd>9 ? '' : '0') + dd, (mm>9 ? '' : '0') + mm, yyyy].join('/');
  client.get(key, function(err, yemekJson) {
    if(!yemekJson) {
      onError();
      console.log(err);
    }else{
      yemekObject = JSON.parse(yemekJson);
      onSuccess(yemekObject);
    }
  });
}
function getLunch(date, onSuccess, onError) {
  getYemek(date, function success(yemekObject) {
    onSuccess(yemekObject[constants.LUNCH_IDENTIFIER]);
  }, onError);
}

function getDinner(date, onSuccess, onError) {
  getYemek(date, function success(yemekObject) {
    onSuccess(yemekObject[constants.DINNER_IDENTIFIER]);
  }, onError);
}

function sendLunchToChannel(date, channel, onSuccess, onError) {
  getLunch(date, function(data) {
    var meals = data;
    var message;
    for (var i = 0; i < meals.length; i++) {
      message += meals[i] + "\n"
    }
    message += "*Afiyet olsun!* :meat_on_bone:"
    bot.postMessage(channel, message).always(function(data) {
      if(data._value.ok){
        onSuccess();
      }else{
        onError(data._value.error);
      }
    });
  });
}

function sendDinnerToChannel(date, channel, onSuccess, onError) {
  getDinner(date, function(data) {
    var meals = data;
    var message;
    if(!meals || meals === {}) {
      message = "Bugünün yemeklerini söyleyemiyorum, çok üzgünüm :(";
    }else{
      message = "*Bugünkü öğle yemeği:*\n";
      for (var i = 0; i < meals.length; i++) {
        message += meals[i] + "\n"
      }
      message += "*Afiyet olsun!* :meat_on_bone:"
    }
    bot.postMessage(channel, message).always(function(data) {
      if(data._value.ok){
        onSuccess();
      }else{
        onError(data._value.error);
      }
    });
    }
  });
}

function sendLunchToUser(date, userChannel, onSuccess, onError) {
  getLunch(date, function onSuccess(data) {
    var meals = data;
    var message;
    if(!meals || meals === {}) {
      message = "Bugünün yemeklerini söyleyemiyorum, çok üzgünüm :(";
    }else{
      message = "*Bugünkü öğle yemeği:*\n";
      for (var i = 0; i < meals.length; i++) {
        message += meals[i] + "\n"
      }
      message += "*Afiyet olsun!* :meat_on_bone:"
    }
    bot.postMessage(userChannel, message, function(data) {
      onSuccess();
      if(!data) {
        onSuccess();
      }else{
        onError(data.message);
      }
    });
  });
}

function sendDinnerToUser(date, userChannel, onSuccess, onError) {
  getDinner(date, function onSuccess(data) {
    var meals = data;
    var message;
    if(!meals || meals === {}) {
      message = "Bugünün yemeklerini söyleyemiyorum, çok üzgünüm :(";
    }else{
      message = "*Bugünkü akşam yemeği:*\n";
      for (var i = 0; i < meals.length; i++) {
        message += meals[i] + "\n"
      }
      message += "*Afiyet olsun!* :meat_on_bone:"
    }
    bot.postMessage(userChannel, message, function(data) {
      if(!data) {
        onSuccess();
      }else{
        onError(data.message);
      }
    });
  });
}

bot.on('message', function(message) {
    //message = JSON.parse(data)
    var type = message.type
    var subtype = message.subtype
    var text = message.text
    var channel = message.channel
    var userId = message.user;

    if(type == "message" && subtype != "bot_message"){
      if(text.toLowerCase().match("aksam|akşam")){
        sendDinnerToUser(new Date(), channel);
      }else if(text.toLowerCase().match("ogle|öğle")){
        sendLunchToUser(new Date(), channel);
      }else{
        bot.postMessage(channel,
          "Selam! Bana \"öğle\" yazarsan bugünün öğle yemeklerini; bana \"akşam\" yazarsan bugünün akşam yemeklerini söylerim!");
      }
    }
});



module.exports = {
  sendLunch: function(date, onSuccess, onError) { sendLunchToChannel(date, channel, onSuccess, onError); },
  sendDinner: function(date, onSuccess, onError) { sendDinnerToChannel(date, channel, onSuccess, onError); }
}
