/* jshint esversion: 6 */
class Currency {
  constructor(name, conv, long = null) {
    this.name = name;
    this.longname = long || name;
    this.conversion = conv;
    //    this.index = 0;
    this.counter = 0;
    self.values = [];
  }

  getHistoricLast(coinlist, ind) {
    var self = this;
    //this.index = ind;

    var hoursOrMinutes = coinlist.hourOrMin;

    coinlist.api.getHistorical(hoursOrMinutes, this.name, this.conversion, coinlist.valuesCount, function(data) {
      self.saveGraph(data);
      coinlist.increaseCounter();
    }, function() {
      coinlist.increaseCounter();
    }, 0);

  }

  saveGraph(data) {
    var self = this;
    self.values = [];
    if (data.Response == "Error") {
      console.log(this.name + " Error");
      return;
    }

    self.values.max = data.Data.reduce(function(a, b) {
      return Math.max(a, b.close);
    }, 0);

    self.values.min = data.Data.reduce(function(a, b) {
      return Math.min(a, b.close);
    }, self.values.max);

    self.values.mid = (self.values.max + self.values.min) / 2;

    self.values.maxRelative = self.values.max / self.values.mid * 100 - 100;
    self.values.data = [];
    self.values.timeTo = data.TimeTo;
    self.values.timeFrom = data.TimeFrom;

    for (let i in data.Data) {
      self.values.data.push({
        close: data.Data[i].close,
        relative: (data.Data[i].close - self.values.mid) / self.values.mid * 100,
        time: data.Data[i].time
      });
    }
  }
}
