var http = require('http');
var fs = require('fs');
var exec = require('child_process').exec;
var constants = require('../constants/fileConstants');

function savePdfFile() {
  return new Promise(function(resolve, reject) {
    http.get(constants.PDF_URL, function(res) {
      var chunks = [];
      res.on('data', function(chunk) {
        chunks.push(chunk); // saves got chunks
      });

      res.on('end', function() {
        chunks = Buffer.concat(chunks);
        fs.writeFileSync(constants.RAW_PDF_NAME, chunks, 'binary');
        resolve(chunks);
      });
    });
  });
}

function pdfToHtml(callback) {
  return new Promise(function(resolve, reject) {
    exec("pdftohtml -enc UTF-8 " + constants.RAW_PDF_NAME
    + " temp && rm temp.html && rm temp_ind.html && mv temps.html "
    + constants.RAW_HTML_NAME
    + " && rm " + constants.RAW_PDF_NAME, callback);
  });
}

function getHtmlContent() {
  return new Promise(function(resolve, reject) {
    fs.readFile(constants.RAW_HTML_NAME, function(err, data) {
      if(err) {
        reject(err);
        return 1;
      }

      resolve(data.toString('utf8')); //data is a buffer, turned that to utf8
    });
  });
}

function htmlToJSON(callback) {
  getHtmlContent().then(function(htmlRawData) {
    var textRawData = htmlRawData.replace(/<\/?[^>]+(>|$)/gm, ''); // removes html tags
    var datesRegex = /\s*\d{2}\/\s*\d{2}\/\s*\d{4}/g;
    var dates = textRawData
    .match(datesRegex)
    .map(function(data) { 
      return data.replace(new RegExp('\n', 'g'), '')
    });
    var days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    var rawDataArray = textRawData.split('\n');
    var dayFiltered = rawDataArray.filter(function(data) { return !days.includes(data); }); //days are gone
    var yemekList = {};

    dates.forEach(function(date) {
      var oneYemekList = {};
      yemekList[date] = {};
      oneYemekList[constants.LUNCH_IDENTIFIER] = [];
      oneYemekList[constants.DINNER_IDENTIFIER] = [];
      var dateIndex = dayFiltered.indexOf(date);
      oneYemekList[constants.LUNCH_IDENTIFIER].push(dayFiltered[dateIndex - 2]);
      oneYemekList[constants.DINNER_IDENTIFIER].push(dayFiltered[dateIndex - 1]);

      for(var i = 0; i < 7; i += 2) {
        oneYemekList[constants.LUNCH_IDENTIFIER].push(dayFiltered[dateIndex + 1 + i]);
        oneYemekList[constants.DINNER_IDENTIFIER].push(dayFiltered[dateIndex + 2 + i]);
      }
      var isOneYemekListForLunchCorrect = oneYemekList[constants.LUNCH_IDENTIFIER].reduce(function(acc, val) {
        return acc && !datesRegex.test(val);
      }, true);
      var isOneYemekListForDinnerCorrect = oneYemekList[constants.DINNER_IDENTIFIER].reduce(function(acc, val) {
        return acc && !datesRegex.test(val);
      }, true);

      var isOneYemekListCorrect = isOneYemekListForLunchCorrect && isOneYemekListForDinnerCorrect;
      if(!isOneYemekListCorrect) console.log(date + " hatalı");
      if(isOneYemekListCorrect) yemekList[date] = oneYemekList;
    });

    callback(JSON.stringify(yemekList));

  });
}

module.exports = {
  getJSONMonthlyYemekList: function(callback) {
    savePdfFile()
    .then(pdfToHtml)
    .then(htmlToJSON(callback));
  }
}
