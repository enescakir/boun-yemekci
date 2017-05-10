var bot = require('../helpers/yemekciBot');

var today = new Date();
bot.sendLunch(today);
bot.sendLunchToTwitter(today);
