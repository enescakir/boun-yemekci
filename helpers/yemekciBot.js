var SlackBot = require('slackbots');
var processor = require('../helpers/processor');
var constants = require('../constants/fileConstants');
var redis = require('redis');
var client = redis.createClient();

var bot = new SlackBot({
    token: "",
    name: 'yemekci'
});

var channel = "yemekci-deneme";

function getLunch(date) {
  return new Promise(function() {
    var dd = date.getDate();
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var yyyy = date.getFullYear();
    var key = [(dd>9 ? '' : '0') + dd, (mm>9 ? '' : '0') + mm, yyyy].join('/');

    client.get(key, function(err, yemekJson) {
      yemekObject = JSON.parse(yemekJson)
      return yemekObject[constants.LUNCH_IDENTIFIER]
    });
  });
}

function sendLunch(date, onSuccess, onError) {
  var dd = date.getDate();
  var mm = date.getMonth() + 1; // getMonth() is zero-based
  var yyyy = date.getFullYear();
  var key = [(dd>9 ? '' : '0') + dd, (mm>9 ? '' : '0') + mm, yyyy].join('/');

  client.get(key, function(err, yemekJson) {
    yemekObject = JSON.parse(yemekJson)
    var meals = yemekObject[constants.LUNCH_IDENTIFIER]
    var message = "*Bugünkü öğle yemeği:*\n"
    for (var i = 0; i < meals.length; i++) {
      message += meals[i] + "\n"
    }
    message += "*Afiyet olsun!* :meat_on_bone:"
    bot.postMessageToChannel(channel, message).then(onSuccess).fail(onError);
  });
}

function sendDinner(date, successCallback, errorCallback) {
  var dd = date.getDate();
  var mm = date.getMonth() + 1; // getMonth() is zero-based
  var yyyy = date.getFullYear();
  var key = [(dd>9 ? '' : '0') + dd, (mm>9 ? '' : '0') + mm, yyyy].join('/');
  client.get(key, function(err, yemekJson) {
    yemekObject = JSON.parse(yemekJson)
    var meals = yemekObject[constants.DINNER_IDENTIFIER]
    var message = "*Bugünkü akşam yemeği:*\n"
    for (var i = 0; i < meals.length; i++) {
      message += meals[i] + "\n"
    }
    message += "*Afiyet olsun!* :meat_on_bone:"
    bot.postMessageToChannel(channel, message).then(successCallback).fail(errorCallback);
  });
}

bot.on('message', function(message) {
    // message = JSON.parse(data)
    var type = message.type
    var subtype = message.subtype
    var text = message.text
    var channel = message.channel
    if(type == "message" && subtype != "bot_message"){
      if(text.toLowerCase().match("aksam|akşam")){
        //bot.postMessage(channel, "akşam mı?")
        sendDinner(new Date())
      }
      if(text.toLowerCase().match("ogle|öğle")){
        sendLunch(new Date())
        //bot.postMessage(channel, "öğle mi?")
      }
    }
    // // define channel, where bot exist. You can adjust it there https://my.slack.com/services
    // bot.postMessageToChannel('general', 'meow!', params);
    //
    // // define existing username instead of 'user_name'
    //
    // // If you add a 'slackbot' property,
    // // you will post to another user's slackbot channel instead of a direct message
    // bot.postMessageToUser('user_name', 'meow!', { 'slackbot': true, icon_emoji: ':cat:' });
    //
    // // define private group instead of 'private_group', where bot exist
    // bot.postMessageToGroup('private_group', 'meow!', params);
});



module.exports = {
  sendLunch: function(date, onSuccess, onError) { sendLunch(date, onSuccess, onError) },
  sendDinner: function(date, onSuccess, onError) { sendDinner(date, onSuccess, onError) }
}


// bot.postMessageToChannel('yemekci-deneme', 'Ne vereyim abime!').always(function(data) {
//     console.log(data)
// });
