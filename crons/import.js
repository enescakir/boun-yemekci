class Importer {
  constructor(params) {
    this.processor = params.processor;
    this.client = params.client;
  }

  importToRedis() {
    var that = this;
    this.processor.getJSONMonthlyYemekList(function(data) {
      data = JSON.parse(data);
      Object.keys(data).forEach(function(key, index) {
        that.client.set(key, JSON.stringify(data[key]));
        console.log(key + " saved");
      });
    });
  }
}

module.exports = Importer;

