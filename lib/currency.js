"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jshint esversion: 6 */
var Currency = function () {
  function Currency(name, conv) {
    var long = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, Currency);

    this.name = name;
    this.longname = long || name;
    this.conversion = conv;
    //    this.index = 0;
    this.counter = 0;
    self.values = [];
  }

  _createClass(Currency, [{
    key: "getHistoricLast",
    value: function getHistoricLast(coinlist, ind) {
      var self = this;
      //this.index = ind;

      var hoursOrMinutes = coinlist.hourOrMin;

      coinlist.api.getHistorical(hoursOrMinutes, this.name, this.conversion, coinlist.valuesCount, function (data) {
        self.saveGraph(data);
        coinlist.increaseCounter();
      }, function () {
        coinlist.increaseCounter();
      }, 0);
    }
  }, {
    key: "saveGraph",
    value: function saveGraph(data) {
      var self = this;
      self.values = [];
      if (data.Response == "Error") {
        console.log(this.name + " Error");
        return;
      }

      self.values.max = data.Data.reduce(function (a, b) {
        return Math.max(a, b.close);
      }, 0);

      self.values.min = data.Data.reduce(function (a, b) {
        return Math.min(a, b.close);
      }, self.values.max);

      self.values.mid = (self.values.max + self.values.min) / 2;

      self.values.maxRelative = self.values.max / self.values.mid * 100 - 100;
      self.values.data = [];
      self.values.timeTo = data.TimeTo;
      self.values.timeFrom = data.TimeFrom;

      for (var i in data.Data) {
        self.values.data.push({
          close: data.Data[i].close,
          relative: (data.Data[i].close - self.values.mid) / self.values.mid * 100,
          time: data.Data[i].time
        });
      }
    }
  }]);

  return Currency;
}();
//# sourceMappingURL=../currency.js.map