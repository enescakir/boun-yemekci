var bot = require('../helpers/yemekciBot');
var dotenv = require('dotenv').config();

var today = new Date();
bot.sendDinner(today);
bot.sendDinnerToTwitter(today);
