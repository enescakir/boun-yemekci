var redis = require('redis');
var dotenv = require('dotenv').config();
var client = redis.createClient();

processor.getJSONMonthlyYemekList(function(data) {
  data = JSON.parse(data)
  Object.keys(data).forEach(function(key,index) {
    client.set(key, JSON.stringify(data[key]));
    console.log(key + " saved")
  });
});
