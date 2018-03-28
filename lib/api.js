"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jshint esversion: 6 */

var CurrencyAPI = function () {
  function CurrencyAPI() {
    _classCallCheck(this, CurrencyAPI);
  }

  _createClass(CurrencyAPI, [{
    key: "getHistorical",
    value: function getHistorical(hoursOrMinutes, name, conversion, valuesCount) {
      var counter = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

      var self = this;
      if (name == conversion) {
        return Promise.resolve(self.always1(hoursOrMinutes, valuesCount));
      }
      return fetch("https://min-api.cryptocompare.com/data/histo" + hoursOrMinutes + "?fsym=" + name + "&tsym=" + conversion + "&limit=" + valuesCount).then(function (response) {
        return response.json();
      }).then(function (data) {
        if (data.Response == "Error") {
          if (counter < 5) {
            return self.getHistorical(hoursOrMinutes, name, conversion, valuesCount, counter + 1);
          }
        } else {
          return data;
        }
      });
    }
  }, {
    key: "getCurrent",
    value: function getCurrent() {}
  }, {
    key: "getCoins",
    value: function getCoins() {
      return fetch("https://min-api.cryptocompare.com/data/all/coinlist").then(function (response) {
        return response.json();
      });
    }
  }, {
    key: "always1",
    value: function always1(hoursOrMinutes, valuesCount) {
      var interval = 60;
      if (hoursOrMinutes == "hour") {
        interval = 3600;
      }
      if (hoursOrMinutes == "day") {
        interval = 3600 * 24;
      }
      var currentTime = Math.floor(Date.now() / 1000);
      currentTime -= currentTime % interval;
      var timeFrom = currentTime - interval * valuesCount;

      var data = {
        TimeTo: currentTime,
        TimeFrom: timeFrom,
        Data: [{
          close: 1,
          time: timeFrom
        }, {
          close: 1,
          time: currentTime
        }]
      };
      return data;
    }
  }]);

  return CurrencyAPI;
}();
//# sourceMappingURL=../map/api.js.map