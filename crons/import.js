var redis = require('redis');
var dotenv = require('dotenv').config();
var processor = require("../helpers/processor");

processor.getJSONMonthlyYemekList(function(data) {
  var client = redis.createClient();
  data = JSON.parse(data)
  Object.keys(data).forEach(function(key,index) {
    client.set(key, JSON.stringify(data[key]));
    console.log(key + " saved");
  });
  client.quit();
});
