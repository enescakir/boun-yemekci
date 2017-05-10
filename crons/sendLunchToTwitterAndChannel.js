var bot = require('../helpers/yemekciBot');
var dotenv = require('dotenv').config();

var today = new Date();
bot.sendLunch(today);
bot.sendLunchToTwitter(today);
