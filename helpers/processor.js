var http = require('http');
var fs = require('fs');
var exec = require('child_process').exec;
var constants = require('../constants/fileConstants');

function savePdfFile(callback) {
  http.get(constants.PDF_URL, function(res) {
    var chunks = [];
    res.on('data', function(chunk) {
      chunks.push(chunk); // saves got chunks
    });

    res.on('end', function() {
      chunks = Buffer.concat(chunks);
      fs.writeFileSync(constants.RAW_PDF_NAME, chunks, 'binary');
      callback(); // runs the callback function
    });
  });
}

savePdfFile(function() {
  exec("pdftohtml " + constants.RAW_PDF_NAME + " temp && rm temp.html && rm temp_ind.html && mv temps.html " + constants.RAW_HTML_NAME);
  exec("rm " + constants.RAW_PDF_NAME); // remove the unneccessary pdf
})
