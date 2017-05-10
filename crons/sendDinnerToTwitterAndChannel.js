var bot = require('../helpers/yemekciBot');

var today = new Date();
bot.sendDinner(today);
bot.sendDinnerToTwitter(today);
