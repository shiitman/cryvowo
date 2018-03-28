"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*jshint esversion: 6 */

var Coinlist = function () {
  function Coinlist(api) {
    _classCallCheck(this, Coinlist);

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

  _createClass(Coinlist, [{
    key: "upgradeCurrList",
    value: function upgradeCurrList(str) {
      var self = this;
      this.myCurr = str.split(",");
      this.myCurr.map(function (val, index) {
        if (val === "") {
          self.myCurr.splice(index, 1);
        }
      });
    }
  }, {
    key: "showLast",
    value: function showLast(graph) {
      var hourOrMin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var valuesCount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

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
        if (timeout == 0) timeout += 60000;
      }
      if (this.hourOrMin == "hour") {
        timeout = 3600000 - Date.now() % 3600000;
        if (timeout == 0) timeout += 3600000;
      }
      if (this.hourOrMin != "day") {
        this.interval = setInterval(function () {
          self.showLast(graph);
        }, timeout);
      }
    }
  }, {
    key: "increaseCounter",
    value: function increaseCounter() {
      this.counter++;
      if (this.counter >= this.myCurr.length) {
        this.isLoading = false;
        this.graph.drawGraph(this, this.hourOrMin, this.valuesCount);
        this.counter = 0;
      }
    }
  }]);

  return Coinlist;
}();
//# sourceMappingURL=../map/coinlist.js.map