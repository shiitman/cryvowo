/* jshint esversion: 6 */

class Coinlist {
  constructor(api) {
    this.myCurr = [];
    this.graph = null;
    this.currencies = [];
    this.hourOrMin = "minute";
    this.counter = 0;
    this.convertTo = "USD";
    this.valuesCount = 720;
    this.isLoading = false;
    this.api = api;
  }

  upgradeCurrList(str) {
    var self = this;
    this.myCurr = str.split(",");
    this.myCurr.map(function(val, index) {
      if (val === "") {
        self.myCurr.splice(index, 1);
      }
    });
  }

  showLast(graph, hourOrMin = null, valuesCount = null) {
    var self = this;

    if (!this.isLoading) {
      this.isLoading = true;
    } else {
      return;
    }

    this.graph = graph || this.graph;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    if (hourOrMin !== null) {
      this.hourOrMin = hourOrMin;
    }
    if (valuesCount !== null) {
      this.valuesCount = valuesCount;
    }

    this.counter = 0;

    this.currencies = [];
    for (var i in this.myCurr) {
      var curr = new Currency(this.myCurr[i], this.convertTo);
      curr.getHistoricLast(this, i);
      this.currencies.push(curr);
    }

    var timeout = 0;
    if (this.hourOrMin == "minute") {
      timeout = 60000 - Date.now() % 60000;
      if (timeout == 0)
        timeout += 60000;
      }
    if (this.hourOrMin == "hour") {
      timeout = 3600000 - Date.now() % 3600000;
      if (timeout == 0)
        timeout += 3600000;
      }
    if (this.hourOrMin != "day") {
      this.interval = setInterval(function() {
        self.showLast(graph);
      }, timeout);
    }
  }

  increaseCounter() {
    this.counter++;
    if (this.counter >= this.myCurr.length) {
      this.isLoading = false;
      this.graph.drawGraph(this, this.hourOrMin, this.valuesCount);
      this.counter = 0;
    }
  }
}
