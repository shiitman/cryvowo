/*jshint esversion: 6 */
class Currency {
  constructor(name, conv) {
    this.name = name;
    this.conversion = conv;
    this.index = 0;
    this.counter = 0;
  }

  getHistoricLast(coinlist, ind) {
    var self = this;
    this.index = ind;

    var hoursOrMinutes = coinlist.hourOrMin;

    this.values = [];
    if (this.conversion != this.name) {
      coinlist.api.getHistorical(hoursOrMinutes, this.name, this.conversion, coinlist.valuesCount,
        function(data) {
          self.saveGraph(data, coinlist.graph);
          coinlist.increaseCounter();
        },
        function() {
          coinlist.increaseCounter();
        },
        0
      );
    } else {
      coinlist.increaseCounter();
    }
  }

  saveGraph(data, drawObj) {
    var self = this;
    if (data.Response == "Error") {
      console.log(this.name + " Error");
      self.values = [];
      return;
    }
    var timeDiff = (data.TimeTo - data.TimeFrom);

    var max = data.Data[0].close;
    var min = data.Data[0].close;
    for (let i in data.Data) {
      if (max < data.Data[i].close) {
        max = data.Data[i].close;
      }
      if (min > data.Data[i].close) {
        min = data.Data[i].close;
      }
    }
    var mid = (max + min) / 2;

    self.values.max = max;
    self.values.min = min;
    self.values.mid = mid;
    self.values.max_r = (max - mid) / mid * 100;
    self.values.min_r = (min - mid) / mid * 100;
    self.values.mid_r = 0;

    self.values.data = [];
    self.values.timeTo = data.TimeTo;
    self.values.timeFrom = data.TimeFrom;
    for (let i in data.Data) {
      var rel = (data.Data[i].close - mid) / mid * 100;
      self.values.data.push({
        close: data.Data[i].close,
        relative: rel,
        time: data.Data[i].time
      });
    }
  }
}