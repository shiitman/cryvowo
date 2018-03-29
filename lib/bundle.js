(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jshint esversion: 6 */

var CurrencyAPI = exports.CurrencyAPI = function () {
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

exports.default = { CurrencyAPI: CurrencyAPI };

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Coinlist = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* jshint esversion: 6 */


var _currency = require("./currency.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Coinlist = exports.Coinlist = function () {
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
        var curr = new _currency.Currency(this.myCurr[i], this.convertTo);
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

},{"./currency.js":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jshint esversion: 6 */
var Currency = exports.Currency = function () {
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

      coinlist.api.getHistorical(hoursOrMinutes, this.name, this.conversion, coinlist.valuesCount).then(function (data) {
        self.saveGraph(data);
        coinlist.increaseCounter();
      }).catch(function () {
        coinlist.increaseCounter();
      });
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

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jshint esversion: 6 */

// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function () {
  return this.each(function () {
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function () {
  return this.each(function () {
    var firstChild = this.parentNode.firstChild;
    if (firstChild) {
      this.parentNode.insertBefore(this, firstChild);
    }
  });
};

var DrawGraph = exports.DrawGraph = function () {
  function DrawGraph(svg, startX, startY, buttonY, buttWidth, buttHeight, width, height) {
    _classCallCheck(this, DrawGraph);

    this.svg = svg;
    this.startX = startX;
    this.startY = startY;
    this.buttonY = buttonY;
    this.buttonWidth = buttWidth;
    this.buttonHeight = buttHeight;

    this.height = height - startY * 2 - 10;
    this.width = width - startX - 10;

    this.div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
    this.resetPaper();
  }

  _createClass(DrawGraph, [{
    key: "resize",
    value: function resize(startX, startY, buttonY, buttWidth, buttHeight, width, height) {
      this.startX = startX;
      this.startY = startY;
      this.buttonY = buttonY;
      this.buttonWidth = buttWidth;
      this.buttonHeight = buttHeight;

      this.height = height - startY * 2 - 10;
      this.width = width - startX - 10;

      this.drawGraph();
    }
  }, {
    key: "resetPaper",
    value: function resetPaper() {
      this.resetGraph();
      this.colors = [];
    }
  }, {
    key: "resetGraph",
    value: function resetGraph() {
      this.svg.selectAll("*").remove();
    }
  }, {
    key: "initColors",
    value: function initColors(currencies, size) {

      console.log(currencies, size);
      for (var i = 0; i < size; i++) {

        this.colors[i] = DrawGraph.generateColor(currencies[i].name + "/" + currencies[i].name);
      }
    }
  }, {
    key: "drawGraph",
    value: function drawGraph(coinlist) {
      var self = this;
      if (coinlist) {
        this.coinlist = coinlist;
      }
      if (!coinlist) {
        coinlist = this.coinlist;
      }
      if (!coinlist || coinlist.isLoading) {
        return;
      }

      this.resetPaper();

      this.initColors(coinlist.currencies, coinlist.currencies.length);

      var maxVal = coinlist.currencies.reduce(function (a, b) {
        return Math.max(a, b.values.maxRelative);
      }, 0);

      var timeFrom = coinlist.currencies.reduce(function (a, b) {
        return Math.min(a, b.values.timeFrom);
      }, Number.MAX_VALUE);

      var timeTo = coinlist.currencies.reduce(function (a, b) {
        return Math.max(a, b.values.timeTo);
      }, 0);

      var scaleY = d3.scaleLinear().domain([100 + maxVal, 100 - maxVal]).range([0, this.height]);

      var scaleX = d3.scaleTime().domain([new Date(timeFrom * 1000 - 1), new Date(timeTo * 1000 + 1)]).range([0, this.width]);

      var timeFormat = d3.timeFormat("%H:%M %d-%m-%Y");

      var y_axis = d3.axisLeft().ticks(20).scale(scaleY);
      var x_axis = d3.axisBottom().ticks(20).tickFormat(timeFormat).scale(scaleX);

      this.svg.append("g").attr("transform", "translate(" + this.startX + "," + this.startY + ")").call(y_axis);
      this.svg.append("g").attr("transform", "translate(" + this.startX + ", " + (this.height + this.startY) + ")").call(x_axis).selectAll("text").style("text-anchor", "end").text(function (d) {
        var t = d3.select(this.parentNode).append("text").style("text-anchor", "end").attr("fill", "black").text(timeFormat(d).toString().split(" ")[0]).attr("dx", "-1.8em").attr("dy", ".15em").attr("transform", "rotate(-65)");
        return timeFormat(d).toString().split(" ")[1];
      }).attr("dx", "-.8em").attr("dy", ".15em").attr("transform", "rotate(-65)");

      // add the X gridlines
      this.svg.append("g").attr("class", "grid").attr("transform", "translate(" + self.startX + ", " + (self.height + self.startY) + ")").call(d3.axisBottom(scaleX).ticks(10).tickSize(-self.height).tickFormat(""));

      // add the Y gridlines
      this.svg.append("g").attr("transform", "translate(" + self.startX + ", " + self.startY + ")").attr("class", "grid").call(d3.axisLeft(scaleY).ticks(5).tickSize(-self.width - self.startX).tickFormat(""));

      var selectClick = function selectClick() {
        if (d3.select(this.parentNode).style("opacity") == 1) {
          d3.selectAll(".graph").style("opacity", 0.99);
        } else {
          d3.selectAll(".graph").style("opacity", 0.1);
          d3.select(this.parentNode).style("opacity", 1).moveToFront();
        }
      };

      //add text buttons
      this.svg.selectAll("rect").data(coinlist.currencies).enter().append("rect").attr("x", function (d, ind) {
        return self.startX + ind * self.buttonWidth;
      }).attr("width", self.buttonWidth).attr("height", self.buttonHeight * 1.8).attr("y", self.buttonY).attr("fill", function (d, ind) {
        return self.colors[ind];
      }).attr("class", "button").on("click", function (d) {
        self.svg.select(".graph.c_" + d.name + " > path").node().dispatchEvent(new MouseEvent("click"));
      });

      this.svg.selectAll("text.buttonLabel").data(coinlist.currencies).enter().append("text").attr("x", function (d, ind) {
        return self.startX + ind * self.buttonWidth + self.buttonWidth * 0.5;
      }).attr("fill", function (d, ind) {
        return self.colors[ind];
      }).attr("y", self.buttonY + self.buttonHeight * 0.6).text(function (d) {
        return d.name;
      }).attr("class", "buttonLabel").attr("font-size", self.buttonHeight * 0.6).attr("text-anchor", "middle");

      this.svg.selectAll("text.caption").data(coinlist.currencies).enter().append("text").attr("x", function (d, ind) {
        return self.startX + ind * self.buttonWidth + self.buttonWidth * 0.5;
      }).attr("y", self.buttonY + self.buttonHeight * 0.6 * 2).text(function (d) {
        return d.values.data[d.values.data.length - 1].close;
      }).attr("class", "buttonLabel caption").attr("fill", function (d, ind) {
        return self.colors[ind];
      }).attr("font-size", self.buttonHeight * 0.6).attr("text-anchor", "middle");

      //drawgraph
      var valueline = d3.line().x(function (d) {
        return scaleX(d.time * 1000);
      }).y(function (d) {
        return scaleY(d.relative + 100);
      });

      coinlist.currencies.forEach(function (curr, index) {
        var g = self.svg.append("g").attr("class", "graph c_" + curr.name);
        g.append("path").data([curr.values.data]).attr("class", "path c_" + curr.name).attr("d", valueline).attr("fill", "transparent").attr("stroke", self.colors[index]).attr("transform", "translate(" + self.startX + "," + self.startY + ")").on("click", selectClick).moveToBack();

        g.selectAll("circle .c_" + curr.name).data(curr.values.data).enter().append("circle").attr("class", "c_" + curr.name).attr("cx", function (d) {
          return scaleX(d.time * 1000);
        }).attr("cy", function (d) {
          return scaleY(d.relative + 100);
        }).attr("r", 1).attr("transform", "translate(" + self.startX + "," + self.startY + ")").attr("fill", self.colors[index]).attr("stroke", self.colors[index]).moveToFront().on("click", selectClick).on("mouseover", function (d) {
          d3.select(this).attr("r", 4);
          self.div.transition().duration(200).style("display", "block").style("opacity", 0.9);

          self.div.html(coinlist.currencies[index].name + "<br \>" + d.close + " " + coinlist.convertTo + "<br \>" + timeFormat(new Date(d.time * 1000))).style("position", "absolute").style("left", d3.event.pageX + "px").style("top", d3.event.pageY - 65 + "px");
        }).on("mouseout", function (d) {
          d3.select(this).attr("r", 1);
          self.div.transition().duration(500).style("opacity", 0).style("display", "none");
        });
      });
    }
  }], [{
    key: "generateColor",
    value: function generateColor(str) {
      var hash = 0;
      if (str.length == 0) return hash;
      for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }

      var colors = [0x990000, 0x009900, 0x000099];

      hash = hash % 16777216 /* 2097152 16777216 */; //
      for (var j = 0; j < 3; j++) {
        colors[j] = (((hash & colors[j]) >> 16 - j * 8) + 0x22).toString(16);
        colors[j] = colors[j].length == 1 ? "0" + colors[j] : colors[j];
      }
      console.log(str, "#" + (colors[0] + colors[1] + colors[2]));
      return "#" + (colors[0] + colors[1] + colors[2]);
    }
  }]);

  return DrawGraph;
}();

},{}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* jshint esversion: 6 */

// TODO: Add promises everywhere
// TODO: Clean unnecessary jQuery
// TODO: Multiple windows import {CurrencyAPI} from './api.js';


var _api = require('./api.js');

var _coinlist = require('./coinlist.js');

var _currency = require('./currency.js');

var _drawGraph = require('./drawGraph.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Main = function () {
  function Main() {
    _classCallCheck(this, Main);
  }

  _createClass(Main, [{
    key: 'init',
    value: function init() {
      this.api = new _api.CurrencyAPI();

      this.coinList = new _coinlist.Coinlist(this.api);

      this.api.getCoins().then(function (data) {
        var keys = Object.keys(data.Data);
        for (var i = 0; i < keys.length; i++) {
          $("#currencies").append('<option value=\'' + data.Data[keys[i]].FullName + '\'></option>');
        }
      });

      this.addCurrencies(this.loadStorage());
      this.exchangeCurrency();
      this.updateCurrencyList();
      this.selectedTime();

      this.initInterface(this.graph, this.coinList, window.innerWidth, window.innerHeight);
    }
  }, {
    key: 'addCurrencies',
    value: function addCurrencies(currArray) {
      $("#currlist").empty();
      for (var i = 0; i < currArray.length; i++) {
        this.addCurrencyFromString(currArray[i]);
      }
    }
  }, {
    key: 'selectedTime',
    value: function selectedTime() {
      var timeInterval = localStorage.getItem("timeInterval");
      if (!timeInterval) {
        timeInterval = "show12Hour";
        localStorage.setItem("timeInterval", "show12Hour");
      }
    }
  }, {
    key: 'exchangeCurrency',
    value: function exchangeCurrency() {
      var exchangeCurr = localStorage.getItem("exchangeCurr");
      if (!exchangeCurr) {
        exchangeCurr = "show12Hour";
        localStorage.setItem("exchangeCurr", "USD");
      }
      $("#chooseCurrency option").filter(function () {
        return $(this).text() == exchangeCurr;
      }).prop('selected', true);

      this.coinList.convertTo = $("#chooseCurrency").val();
    }
  }, {
    key: 'addCurrencyFromString',
    value: function addCurrencyFromString(str) {
      var self = this;
      var strings = str.match(/(.*)\((.*)\).*/);
      if (strings.length < 3) {
        return;
      }
      var currName = strings[1];
      var newCurr = strings[2].replace("*", "");

      if ($("#currlist>#" + newCurr).length === 0) {
        $("#currlist").append('<span id="' + newCurr + '" data-longname="' + currName + '" title="' + currName + ' - click to remove">' + newCurr + '</span>');
        $("#currlist>#" + newCurr).css("background-color", _drawGraph.DrawGraph.generateColor(newCurr + "/" + newCurr));

        $("#currlist>#" + newCurr).click(function () {
          this.remove();
          self.updateCurrencyList();
          self.coinList.showLast(self.graph);
        });
      }
      $('#currlist>#' + newCurr).button();
    }
  }, {
    key: 'loadStorage',
    value: function loadStorage() {
      var storage = localStorage.getItem("currencies");
      if (!storage) {
        localStorage.setItem("currencies", ["Bitcoin (BTC)", "Etherum (ETH)", "Litecoin (LTC)", "DigitalCash (DASH)", "Dogecoin (DOGE)"]);
        return initialCurrencies;
      } else {
        var array = storage.split(",");
        for (var i in array) {
          if (array[i].match(/(.*)\((.*)\).*/).length < 3) {
            localStorage.setItem("currencies", initialCurrencies);
            return initialCurrencies;
          }
        }
        return array;
      }
    }
  }, {
    key: 'updateCurrencyList',
    value: function updateCurrencyList() {
      var currString = "";
      var currencyNames = [];
      $("#currlist>span").each(function () {
        currString += this.id + ",";
        currencyNames.push($(this).data("longname") + ('(' + this.id + ')'));
      });
      localStorage.setItem("currencies", currencyNames);

      currString = currString.slice(0, -1);
      this.coinList.upgradeCurrList(currString);
    }
  }, {
    key: 'initInterface',
    value: function initInterface(graph, coinList, width, height) {
      var self = this;
      $(window).resize(function (event) {
        if (event.target != window && $(event.target).find(".renderCanvas").length > 0) {
          self.resizeWindow(event.target);
        }
      });

      $("#currency").change(function () {
        self.addCurrencyFromString($("#currency").val());
        self.updateCurrencyList();
        self.coinList.showLast(self.graph);
        $("#currency").val("");
      });

      /* generate radio buttons */
      fetch("./../settings/buttonList.json").then(function (resolved) {
        return resolved.json();
      }).then(function (buttonsList) {
        console.log(buttonsList);
        for (var i in buttonsList) {
          $("#control").append('<input id="' + buttonsList[i].id + '" type="radio" name="interval"><label for="' + buttonsList[i].id + '" class="intervalLabel">' + buttonsList[i].caption + '</label><br />');
          (function (i) {
            $("#" + buttonsList[i].id).click(function () {
              coinList.showLast(self.graph, buttonsList[i].time, buttonsList[i].count);
              localStorage.setItem("timeInterval", buttonsList[i].id);
            });
          })(i);
        }
        $("#control>input").checkboxradio({
          icon: false,
          classes: {
            "ui-checkboxradio": "highlight"
          }
        });

        $("#" + localStorage.getItem("timeInterval")).click();
      });

      $("#chooseCurrency").change(function () {
        localStorage.setItem("exchangeCurr", $("#chooseCurrency").val());
        coinList.convertTo = $("#chooseCurrency").val();
        coinList.showLast(self.graph);
      });

      var currency = $("#currencyWindow").dialog({
        closeOnEscape: false,
        width: 600,
        height: 140,
        minWidth: 600,
        dialogClass: "no-close",
        position: {
          my: "left bottom",
          at: "left top",
          of: window
        }
      });

      var winWidth = window.innerWidth * 0.9;
      var winHeight = window.innerHeight * 0.77;
      $("#renderCanvas").dialog({
        closeOnEscape: false,
        width: winWidth,
        height: winHeight,
        dialogClass: "no-close",
        position: {
          my: "left top",
          at: "left bottom",
          of: currency
        }
      });

      var svg = d3.select("#renderCanvas").append("svg:svg").attr("id", "svg");
      d3.select("svg").attr("width", winWidth - 150).attr("height", winHeight - 50);

      this.graph = new _drawGraph.DrawGraph(svg, 50, 55, 5, 100, 20, winWidth - 155, winHeight - 50);

      $("#addImg").detach().appendTo($("#renderCanvas").parent().find(".ui-dialog-titlebar>.ui-dialog-title"));
      $("#addImg").button();

      $("#currencyWindow").dialog();
      //$("#control").dialog();

      $("#addImg").click(function () {

        var serializer = new XMLSerializer();

        var a = document.createElement('a');
        a.download = 'cryptochart.svg';
        a.type = 'image/svg+xml';
        var blob = new Blob(['<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString($("#svg")[0])], { "type": "image/svg+xml" });
        a.href = (window.URL || webkitURL).createObjectURL(blob);
        a.click();
        $(a).detach();
      });
    }
  }, {
    key: 'resizeWindow',
    value: function resizeWindow(target) {
      d3.select("svg").attr("width", $(target).width() - 110).attr("height", $(target).height() - 50);
      this.graph.resize(50, 55, 5, 100, 20, $(target).width() - 110, $(target).height() - 50);
    }
  }]);

  return Main;
}();

$(document).ready(function () {
  var main = new Main();
  main.init();
});

},{"./api.js":1,"./coinlist.js":2,"./currency.js":3,"./drawGraph.js":4}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4xMC4yL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2FwaS5qcyIsInNyYy9jb2lubGlzdC5qcyIsInNyYy9jdXJyZW5jeS5qcyIsInNyYy9kcmF3R3JhcGguanMiLCJzcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUNBQTs7SUFFYSxXLFdBQUEsVztBQUNYLHlCQUFjO0FBQUE7QUFBRTs7OztrQ0FDRixjLEVBQWdCLEksRUFBTSxVLEVBQVksVyxFQUEwQjtBQUFBLFVBQWIsT0FBYSx1RUFBSCxDQUFHOztBQUN4RSxVQUFJLE9BQU8sSUFBWDtBQUNBLFVBQUksUUFBUSxVQUFaLEVBQXdCO0FBQ3RCLGVBQU8sUUFBUSxPQUFSLENBQWdCLEtBQUssT0FBTCxDQUFhLGNBQWIsRUFBNkIsV0FBN0IsQ0FBaEIsQ0FBUDtBQUNEO0FBQ0QsYUFBTyxNQUFNLGlEQUFpRCxjQUFqRCxHQUFrRSxRQUFsRSxHQUE2RSxJQUE3RSxHQUFvRixRQUFwRixHQUErRixVQUEvRixHQUE0RyxTQUE1RyxHQUF3SCxXQUE5SCxFQUEySSxJQUEzSSxDQUFnSixVQUFTLFFBQVQsRUFBbUI7QUFDeEssZUFBTyxTQUFTLElBQVQsRUFBUDtBQUNELE9BRk0sRUFFSixJQUZJLENBRUMsVUFBUyxJQUFULEVBQWU7QUFDckIsWUFBSSxLQUFLLFFBQUwsSUFBaUIsT0FBckIsRUFBOEI7QUFDNUIsY0FBSSxVQUFVLENBQWQsRUFBaUI7QUFDZixtQkFBTyxLQUFLLGFBQUwsQ0FBbUIsY0FBbkIsRUFBbUMsSUFBbkMsRUFBeUMsVUFBekMsRUFBcUQsV0FBckQsRUFBa0UsVUFBVSxDQUE1RSxDQUFQO0FBQ0Q7QUFDRixTQUpELE1BSU87QUFDTCxpQkFBUSxJQUFSO0FBQ0Q7QUFDRixPQVZNLENBQVA7QUFXRDs7O2lDQUVZLENBQUU7OzsrQkFFSjtBQUNULGFBQU8sTUFBTSxxREFBTixFQUE2RCxJQUE3RCxDQUFrRSxVQUFTLFFBQVQsRUFBbUI7QUFDMUYsZUFBTyxTQUFTLElBQVQsRUFBUDtBQUNELE9BRk0sQ0FBUDtBQUdEOzs7NEJBRU8sYyxFQUFnQixXLEVBQWE7QUFDbkMsVUFBSSxXQUFXLEVBQWY7QUFDQSxVQUFJLGtCQUFrQixNQUF0QixFQUE4QjtBQUM1QixtQkFBVyxJQUFYO0FBQ0Q7QUFDRCxVQUFJLGtCQUFrQixLQUF0QixFQUE2QjtBQUMzQixtQkFBVyxPQUFPLEVBQWxCO0FBQ0Q7QUFDRCxVQUFJLGNBQWMsS0FBSyxLQUFMLENBQVcsS0FBSyxHQUFMLEtBQWEsSUFBeEIsQ0FBbEI7QUFDQSxxQkFBZSxjQUFjLFFBQTdCO0FBQ0EsVUFBSSxXQUFXLGNBQWMsV0FBVyxXQUF4Qzs7QUFFQSxVQUFJLE9BQU87QUFDVCxnQkFBUSxXQURDO0FBRVQsa0JBQVUsUUFGRDtBQUdULGNBQU0sQ0FDSjtBQUNFLGlCQUFPLENBRFQ7QUFFRSxnQkFBTTtBQUZSLFNBREksRUFJRDtBQUNELGlCQUFPLENBRE47QUFFRCxnQkFBTTtBQUZMLFNBSkM7QUFIRyxPQUFYO0FBYUEsYUFBTyxJQUFQO0FBQ0Q7Ozs7OztrQkFHWSxFQUFDLHdCQUFELEU7Ozs7Ozs7Ozs7cWpCQzNEZjs7O0FBQ0E7Ozs7SUFFYSxRLFdBQUEsUTtBQUNYLG9CQUFZLEdBQVosRUFBaUI7QUFBQTs7QUFDZixTQUFLLE1BQUwsR0FBYyxFQUFkO0FBQ0EsU0FBSyxLQUFMLEdBQWEsSUFBYjtBQUNBLFNBQUssVUFBTCxHQUFrQixFQUFsQjtBQUNBLFNBQUssU0FBTCxHQUFpQixRQUFqQjtBQUNBLFNBQUssT0FBTCxHQUFlLENBQWY7QUFDQSxTQUFLLFNBQUwsR0FBaUIsS0FBakI7QUFDQSxTQUFLLFdBQUwsR0FBbUIsR0FBbkI7QUFDQSxTQUFLLFNBQUwsR0FBaUIsS0FBakI7QUFDQSxTQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0Q7Ozs7b0NBRWUsRyxFQUFLO0FBQ25CLFVBQUksT0FBTyxJQUFYO0FBQ0EsV0FBSyxNQUFMLEdBQWMsSUFBSSxLQUFKLENBQVUsR0FBVixDQUFkO0FBQ0EsV0FBSyxNQUFMLENBQVksR0FBWixDQUFnQixVQUFTLEdBQVQsRUFBYyxLQUFkLEVBQXFCO0FBQ25DLFlBQUksUUFBUSxFQUFaLEVBQWdCO0FBQ2QsZUFBSyxNQUFMLENBQVksTUFBWixDQUFtQixLQUFuQixFQUEwQixDQUExQjtBQUNEO0FBQ0YsT0FKRDtBQUtEOzs7NkJBRVEsSyxFQUE2QztBQUFBLFVBQXRDLFNBQXNDLHVFQUExQixJQUEwQjtBQUFBLFVBQXBCLFdBQW9CLHVFQUFOLElBQU07O0FBQ3BELFVBQUksT0FBTyxJQUFYOztBQUVBLFVBQUksQ0FBQyxLQUFLLFNBQVYsRUFBcUI7QUFDbkIsYUFBSyxTQUFMLEdBQWlCLElBQWpCO0FBQ0QsT0FGRCxNQUVPO0FBQ0w7QUFDRDs7QUFFRCxXQUFLLEtBQUwsR0FBYSxTQUFTLEtBQUssS0FBM0I7O0FBRUEsVUFBSSxLQUFLLFFBQVQsRUFBbUI7QUFDakIsc0JBQWMsS0FBSyxRQUFuQjtBQUNBLGFBQUssUUFBTCxHQUFnQixJQUFoQjtBQUNEOztBQUVELFVBQUksY0FBYyxJQUFsQixFQUF3QjtBQUN0QixhQUFLLFNBQUwsR0FBaUIsU0FBakI7QUFDRDtBQUNELFVBQUksZ0JBQWdCLElBQXBCLEVBQTBCO0FBQ3hCLGFBQUssV0FBTCxHQUFtQixXQUFuQjtBQUNEOztBQUVELFdBQUssT0FBTCxHQUFlLENBQWY7O0FBRUEsV0FBSyxVQUFMLEdBQWtCLEVBQWxCO0FBQ0EsV0FBSyxJQUFJLENBQVQsSUFBYyxLQUFLLE1BQW5CLEVBQTJCO0FBQ3pCLFlBQUksT0FBTyx1QkFBYSxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQWIsRUFBNkIsS0FBSyxTQUFsQyxDQUFYO0FBQ0EsYUFBSyxlQUFMLENBQXFCLElBQXJCLEVBQTJCLENBQTNCO0FBQ0EsYUFBSyxVQUFMLENBQWdCLElBQWhCLENBQXFCLElBQXJCO0FBQ0Q7O0FBRUQsVUFBSSxVQUFVLENBQWQ7QUFDQSxVQUFJLEtBQUssU0FBTCxJQUFrQixRQUF0QixFQUFnQztBQUM5QixrQkFBVSxRQUFRLEtBQUssR0FBTCxLQUFhLEtBQS9CO0FBQ0EsWUFBSSxXQUFXLENBQWYsRUFDRSxXQUFXLEtBQVg7QUFDRDtBQUNILFVBQUksS0FBSyxTQUFMLElBQWtCLE1BQXRCLEVBQThCO0FBQzVCLGtCQUFVLFVBQVUsS0FBSyxHQUFMLEtBQWEsT0FBakM7QUFDQSxZQUFJLFdBQVcsQ0FBZixFQUNFLFdBQVcsT0FBWDtBQUNEO0FBQ0gsVUFBSSxLQUFLLFNBQUwsSUFBa0IsS0FBdEIsRUFBNkI7QUFDM0IsYUFBSyxRQUFMLEdBQWdCLFlBQVksWUFBVztBQUNyQyxlQUFLLFFBQUwsQ0FBYyxLQUFkO0FBQ0QsU0FGZSxFQUViLE9BRmEsQ0FBaEI7QUFHRDtBQUNGOzs7c0NBRWlCO0FBQ2hCLFdBQUssT0FBTDtBQUNBLFVBQUksS0FBSyxPQUFMLElBQWdCLEtBQUssTUFBTCxDQUFZLE1BQWhDLEVBQXdDO0FBQ3RDLGFBQUssU0FBTCxHQUFpQixLQUFqQjtBQUNBLGFBQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsSUFBckIsRUFBMkIsS0FBSyxTQUFoQyxFQUEyQyxLQUFLLFdBQWhEO0FBQ0EsYUFBSyxPQUFMLEdBQWUsQ0FBZjtBQUNEO0FBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbkZIO0lBQ2EsUSxXQUFBLFE7QUFDWCxvQkFBWSxJQUFaLEVBQWtCLElBQWxCLEVBQXFDO0FBQUEsUUFBYixJQUFhLHVFQUFOLElBQU07O0FBQUE7O0FBQ25DLFNBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxTQUFLLFFBQUwsR0FBZ0IsUUFBUSxJQUF4QjtBQUNBLFNBQUssVUFBTCxHQUFrQixJQUFsQjtBQUNBO0FBQ0EsU0FBSyxPQUFMLEdBQWUsQ0FBZjtBQUNBLFNBQUssTUFBTCxHQUFjLEVBQWQ7QUFDRDs7OztvQ0FFZSxRLEVBQVUsRyxFQUFLO0FBQzdCLFVBQUksT0FBTyxJQUFYO0FBQ0E7O0FBRUEsVUFBSSxpQkFBaUIsU0FBUyxTQUE5Qjs7QUFFQSxlQUFTLEdBQVQsQ0FBYSxhQUFiLENBQTJCLGNBQTNCLEVBQTJDLEtBQUssSUFBaEQsRUFBc0QsS0FBSyxVQUEzRCxFQUF1RSxTQUFTLFdBQWhGLEVBQTZGLElBQTdGLENBQWtHLFVBQVMsSUFBVCxFQUFlO0FBQy9HLGFBQUssU0FBTCxDQUFlLElBQWY7QUFDQSxpQkFBUyxlQUFUO0FBQ0QsT0FIRCxFQUdHLEtBSEgsQ0FHUyxZQUFXO0FBQ2xCLGlCQUFTLGVBQVQ7QUFDRCxPQUxEO0FBTUQ7Ozs4QkFFUyxJLEVBQU07QUFDZCxVQUFJLE9BQU8sSUFBWDtBQUNBLFdBQUssTUFBTCxHQUFjLEVBQWQ7QUFDQSxVQUFJLEtBQUssUUFBTCxJQUFpQixPQUFyQixFQUE4QjtBQUM1QixnQkFBUSxHQUFSLENBQVksS0FBSyxJQUFMLEdBQVksUUFBeEI7QUFDQTtBQUNEOztBQUVELFdBQUssTUFBTCxDQUFZLEdBQVosR0FBa0IsS0FBSyxJQUFMLENBQVUsTUFBVixDQUFpQixVQUFTLENBQVQsRUFBWSxDQUFaLEVBQWU7QUFDaEQsZUFBTyxLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksRUFBRSxLQUFkLENBQVA7QUFDRCxPQUZpQixFQUVmLENBRmUsQ0FBbEI7O0FBSUEsV0FBSyxNQUFMLENBQVksR0FBWixHQUFrQixLQUFLLElBQUwsQ0FBVSxNQUFWLENBQWlCLFVBQVMsQ0FBVCxFQUFZLENBQVosRUFBZTtBQUNoRCxlQUFPLEtBQUssR0FBTCxDQUFTLENBQVQsRUFBWSxFQUFFLEtBQWQsQ0FBUDtBQUNELE9BRmlCLEVBRWYsS0FBSyxNQUFMLENBQVksR0FGRyxDQUFsQjs7QUFJQSxXQUFLLE1BQUwsQ0FBWSxHQUFaLEdBQWtCLENBQUMsS0FBSyxNQUFMLENBQVksR0FBWixHQUFrQixLQUFLLE1BQUwsQ0FBWSxHQUEvQixJQUFzQyxDQUF4RDs7QUFFQSxXQUFLLE1BQUwsQ0FBWSxXQUFaLEdBQTBCLEtBQUssTUFBTCxDQUFZLEdBQVosR0FBa0IsS0FBSyxNQUFMLENBQVksR0FBOUIsR0FBb0MsR0FBcEMsR0FBMEMsR0FBcEU7QUFDQSxXQUFLLE1BQUwsQ0FBWSxJQUFaLEdBQW1CLEVBQW5CO0FBQ0EsV0FBSyxNQUFMLENBQVksTUFBWixHQUFxQixLQUFLLE1BQTFCO0FBQ0EsV0FBSyxNQUFMLENBQVksUUFBWixHQUF1QixLQUFLLFFBQTVCOztBQUVBLFdBQUssSUFBSSxDQUFULElBQWMsS0FBSyxJQUFuQixFQUF5QjtBQUN2QixhQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLElBQWpCLENBQXNCO0FBQ3BCLGlCQUFPLEtBQUssSUFBTCxDQUFVLENBQVYsRUFBYSxLQURBO0FBRXBCLG9CQUFVLENBQUMsS0FBSyxJQUFMLENBQVUsQ0FBVixFQUFhLEtBQWIsR0FBcUIsS0FBSyxNQUFMLENBQVksR0FBbEMsSUFBeUMsS0FBSyxNQUFMLENBQVksR0FBckQsR0FBMkQsR0FGakQ7QUFHcEIsZ0JBQU0sS0FBSyxJQUFMLENBQVUsQ0FBVixFQUFhO0FBSEMsU0FBdEI7QUFLRDtBQUNGOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZESDs7QUFFQTtBQUNBLEdBQUcsU0FBSCxDQUFhLFNBQWIsQ0FBdUIsV0FBdkIsR0FBcUMsWUFBVztBQUM5QyxTQUFPLEtBQUssSUFBTCxDQUFVLFlBQVc7QUFDMUIsU0FBSyxVQUFMLENBQWdCLFdBQWhCLENBQTRCLElBQTVCO0FBQ0QsR0FGTSxDQUFQO0FBR0QsQ0FKRDtBQUtBLEdBQUcsU0FBSCxDQUFhLFNBQWIsQ0FBdUIsVUFBdkIsR0FBb0MsWUFBVztBQUM3QyxTQUFPLEtBQUssSUFBTCxDQUFVLFlBQVc7QUFDMUIsUUFBSSxhQUFhLEtBQUssVUFBTCxDQUFnQixVQUFqQztBQUNBLFFBQUksVUFBSixFQUFnQjtBQUNkLFdBQUssVUFBTCxDQUFnQixZQUFoQixDQUE2QixJQUE3QixFQUFtQyxVQUFuQztBQUNEO0FBQ0YsR0FMTSxDQUFQO0FBTUQsQ0FQRDs7SUFTYSxTLFdBQUEsUztBQUNYLHFCQUFZLEdBQVosRUFBaUIsTUFBakIsRUFBeUIsTUFBekIsRUFBaUMsT0FBakMsRUFBMEMsU0FBMUMsRUFBcUQsVUFBckQsRUFBaUUsS0FBakUsRUFBd0UsTUFBeEUsRUFBZ0Y7QUFBQTs7QUFDOUUsU0FBSyxHQUFMLEdBQVcsR0FBWDtBQUNBLFNBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxTQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsU0FBSyxPQUFMLEdBQWUsT0FBZjtBQUNBLFNBQUssV0FBTCxHQUFtQixTQUFuQjtBQUNBLFNBQUssWUFBTCxHQUFvQixVQUFwQjs7QUFFQSxTQUFLLE1BQUwsR0FBYyxTQUFTLFNBQVMsQ0FBbEIsR0FBc0IsRUFBcEM7QUFDQSxTQUFLLEtBQUwsR0FBYSxRQUFRLE1BQVIsR0FBaUIsRUFBOUI7O0FBRUEsU0FBSyxHQUFMLEdBQVcsR0FBRyxNQUFILENBQVUsTUFBVixFQUFrQixNQUFsQixDQUF5QixLQUF6QixFQUFnQyxJQUFoQyxDQUFxQyxPQUFyQyxFQUE4QyxTQUE5QyxFQUF5RCxLQUF6RCxDQUErRCxTQUEvRCxFQUEwRSxDQUExRSxDQUFYO0FBQ0EsU0FBSyxVQUFMO0FBQ0Q7Ozs7MkJBRU0sTSxFQUFRLE0sRUFBUSxPLEVBQVMsUyxFQUFXLFUsRUFBWSxLLEVBQU8sTSxFQUFRO0FBQ3BFLFdBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxXQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsV0FBSyxPQUFMLEdBQWUsT0FBZjtBQUNBLFdBQUssV0FBTCxHQUFtQixTQUFuQjtBQUNBLFdBQUssWUFBTCxHQUFvQixVQUFwQjs7QUFFQSxXQUFLLE1BQUwsR0FBYyxTQUFTLFNBQVMsQ0FBbEIsR0FBc0IsRUFBcEM7QUFDQSxXQUFLLEtBQUwsR0FBYSxRQUFRLE1BQVIsR0FBaUIsRUFBOUI7O0FBRUEsV0FBSyxTQUFMO0FBQ0Q7OztpQ0FFWTtBQUNYLFdBQUssVUFBTDtBQUNBLFdBQUssTUFBTCxHQUFjLEVBQWQ7QUFDRDs7O2lDQUVZO0FBQ1gsV0FBSyxHQUFMLENBQVMsU0FBVCxDQUFtQixHQUFuQixFQUF3QixNQUF4QjtBQUNEOzs7K0JBRVUsVSxFQUFZLEksRUFBTTs7QUFFM0IsY0FBUSxHQUFSLENBQVksVUFBWixFQUF3QixJQUF4QjtBQUNBLFdBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxJQUFwQixFQUEwQixHQUExQixFQUErQjs7QUFFN0IsYUFBSyxNQUFMLENBQVksQ0FBWixJQUFpQixVQUFVLGFBQVYsQ0FBd0IsV0FBVyxDQUFYLEVBQWMsSUFBZCxHQUFxQixHQUFyQixHQUEyQixXQUFXLENBQVgsRUFBYyxJQUFqRSxDQUFqQjtBQUNEO0FBQ0Y7Ozs4QkE0QlMsUSxFQUFVO0FBQ2xCLFVBQUksT0FBTyxJQUFYO0FBQ0EsVUFBSSxRQUFKLEVBQWM7QUFDWixhQUFLLFFBQUwsR0FBZ0IsUUFBaEI7QUFDRDtBQUNELFVBQUksQ0FBQyxRQUFMLEVBQWU7QUFDYixtQkFBVyxLQUFLLFFBQWhCO0FBQ0Q7QUFDRCxVQUFJLENBQUMsUUFBRCxJQUFhLFNBQVMsU0FBMUIsRUFBcUM7QUFDbkM7QUFDRDs7QUFFRCxXQUFLLFVBQUw7O0FBRUEsV0FBSyxVQUFMLENBQWdCLFNBQVMsVUFBekIsRUFBcUMsU0FBUyxVQUFULENBQW9CLE1BQXpEOztBQUVBLFVBQUksU0FBUyxTQUFTLFVBQVQsQ0FBb0IsTUFBcEIsQ0FBMkIsVUFBUyxDQUFULEVBQVksQ0FBWixFQUFlO0FBQ3JELGVBQU8sS0FBSyxHQUFMLENBQVMsQ0FBVCxFQUFZLEVBQUUsTUFBRixDQUFTLFdBQXJCLENBQVA7QUFDRCxPQUZZLEVBRVYsQ0FGVSxDQUFiOztBQUlBLFVBQUksV0FBVyxTQUFTLFVBQVQsQ0FBb0IsTUFBcEIsQ0FBMkIsVUFBUyxDQUFULEVBQVksQ0FBWixFQUFlO0FBQ3ZELGVBQU8sS0FBSyxHQUFMLENBQVMsQ0FBVCxFQUFZLEVBQUUsTUFBRixDQUFTLFFBQXJCLENBQVA7QUFDRCxPQUZjLEVBRVosT0FBTyxTQUZLLENBQWY7O0FBSUEsVUFBSSxTQUFTLFNBQVMsVUFBVCxDQUFvQixNQUFwQixDQUEyQixVQUFTLENBQVQsRUFBWSxDQUFaLEVBQWU7QUFDckQsZUFBTyxLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksRUFBRSxNQUFGLENBQVMsTUFBckIsQ0FBUDtBQUNELE9BRlksRUFFVixDQUZVLENBQWI7O0FBSUEsVUFBSSxTQUFTLEdBQUcsV0FBSCxHQUFpQixNQUFqQixDQUF3QixDQUNuQyxNQUFNLE1BRDZCLEVBRW5DLE1BQU0sTUFGNkIsQ0FBeEIsRUFHVixLQUhVLENBR0osQ0FBQyxDQUFELEVBQUksS0FBSyxNQUFULENBSEksQ0FBYjs7QUFLQSxVQUFJLFNBQVMsR0FBRyxTQUFILEdBQWUsTUFBZixDQUFzQixDQUNqQyxJQUFJLElBQUosQ0FBUyxXQUFXLElBQVgsR0FBa0IsQ0FBM0IsQ0FEaUMsRUFFakMsSUFBSSxJQUFKLENBQVMsU0FBUyxJQUFULEdBQWdCLENBQXpCLENBRmlDLENBQXRCLEVBR1YsS0FIVSxDQUdKLENBQUMsQ0FBRCxFQUFJLEtBQUssS0FBVCxDQUhJLENBQWI7O0FBS0EsVUFBSSxhQUFhLEdBQUcsVUFBSCxDQUFjLGdCQUFkLENBQWpCOztBQUVBLFVBQUksU0FBUyxHQUFHLFFBQUgsR0FBYyxLQUFkLENBQW9CLEVBQXBCLEVBQXdCLEtBQXhCLENBQThCLE1BQTlCLENBQWI7QUFDQSxVQUFJLFNBQVMsR0FBRyxVQUFILEdBQWdCLEtBQWhCLENBQXNCLEVBQXRCLEVBQTBCLFVBQTFCLENBQXFDLFVBQXJDLEVBQWlELEtBQWpELENBQXVELE1BQXZELENBQWI7O0FBRUEsV0FBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFxQixJQUFyQixDQUEwQixXQUExQixpQkFBb0QsS0FBSyxNQUF6RCxTQUFtRSxLQUFLLE1BQXhFLFFBQW1GLElBQW5GLENBQXdGLE1BQXhGO0FBQ0EsV0FBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFxQixJQUFyQixDQUEwQixXQUExQixpQkFBb0QsS0FBSyxNQUF6RCxXQUFvRSxLQUFLLE1BQUwsR0FBYyxLQUFLLE1BQXZGLFNBQWtHLElBQWxHLENBQXVHLE1BQXZHLEVBQStHLFNBQS9HLENBQXlILE1BQXpILEVBQWlJLEtBQWpJLENBQXVJLGFBQXZJLEVBQXNKLEtBQXRKLEVBQTZKLElBQTdKLENBQWtLLFVBQVMsQ0FBVCxFQUFZO0FBQzVLLFlBQUksSUFBSSxHQUFHLE1BQUgsQ0FBVSxLQUFLLFVBQWYsRUFBMkIsTUFBM0IsQ0FBa0MsTUFBbEMsRUFBMEMsS0FBMUMsQ0FBZ0QsYUFBaEQsRUFBK0QsS0FBL0QsRUFBc0UsSUFBdEUsQ0FBMkUsTUFBM0UsRUFBbUYsT0FBbkYsRUFBNEYsSUFBNUYsQ0FBaUcsV0FBVyxDQUFYLEVBQWMsUUFBZCxHQUF5QixLQUF6QixDQUErQixHQUEvQixFQUFvQyxDQUFwQyxDQUFqRyxFQUF5SSxJQUF6SSxDQUE4SSxJQUE5SSxFQUFvSixRQUFwSixFQUE4SixJQUE5SixDQUFtSyxJQUFuSyxFQUF5SyxPQUF6SyxFQUFrTCxJQUFsTCxDQUF1TCxXQUF2TCxFQUFvTSxhQUFwTSxDQUFSO0FBQ0EsZUFBTyxXQUFXLENBQVgsRUFBYyxRQUFkLEdBQXlCLEtBQXpCLENBQStCLEdBQS9CLEVBQW9DLENBQXBDLENBQVA7QUFDRCxPQUhELEVBR0csSUFISCxDQUdRLElBSFIsRUFHYyxPQUhkLEVBR3VCLElBSHZCLENBRzRCLElBSDVCLEVBR2tDLE9BSGxDLEVBRzJDLElBSDNDLENBR2dELFdBSGhELEVBRzZELGFBSDdEOztBQUtBO0FBQ0EsV0FBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFxQixJQUFyQixDQUEwQixPQUExQixFQUFtQyxNQUFuQyxFQUEyQyxJQUEzQyxDQUFnRCxXQUFoRCxpQkFBMEUsS0FBSyxNQUEvRSxXQUEwRixLQUFLLE1BQUwsR0FBYyxLQUFLLE1BQTdHLFNBQXdILElBQXhILENBQTZILEdBQUcsVUFBSCxDQUFjLE1BQWQsRUFBc0IsS0FBdEIsQ0FBNEIsRUFBNUIsRUFBZ0MsUUFBaEMsQ0FBeUMsQ0FBQyxLQUFLLE1BQS9DLEVBQXVELFVBQXZELENBQWtFLEVBQWxFLENBQTdIOztBQUVBO0FBQ0EsV0FBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFxQixJQUFyQixDQUEwQixXQUExQixpQkFBb0QsS0FBSyxNQUF6RCxVQUFvRSxLQUFLLE1BQXpFLFFBQW9GLElBQXBGLENBQXlGLE9BQXpGLEVBQWtHLE1BQWxHLEVBQTBHLElBQTFHLENBQStHLEdBQUcsUUFBSCxDQUFZLE1BQVosRUFBb0IsS0FBcEIsQ0FBMEIsQ0FBMUIsRUFBNkIsUUFBN0IsQ0FBc0MsQ0FBQyxLQUFLLEtBQU4sR0FBYyxLQUFLLE1BQXpELEVBQWlFLFVBQWpFLENBQTRFLEVBQTVFLENBQS9HOztBQUVBLFVBQUksY0FBYyxTQUFkLFdBQWMsR0FBVztBQUMzQixZQUFJLEdBQUcsTUFBSCxDQUFVLEtBQUssVUFBZixFQUEyQixLQUEzQixDQUFpQyxTQUFqQyxLQUErQyxDQUFuRCxFQUFzRDtBQUNwRCxhQUFHLFNBQUgsQ0FBYSxRQUFiLEVBQXVCLEtBQXZCLENBQTZCLFNBQTdCLEVBQXdDLElBQXhDO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsYUFBRyxTQUFILENBQWEsUUFBYixFQUF1QixLQUF2QixDQUE2QixTQUE3QixFQUF3QyxHQUF4QztBQUNBLGFBQUcsTUFBSCxDQUFVLEtBQUssVUFBZixFQUEyQixLQUEzQixDQUFpQyxTQUFqQyxFQUE0QyxDQUE1QyxFQUErQyxXQUEvQztBQUNEO0FBQ0YsT0FQRDs7QUFTQTtBQUNBLFdBQUssR0FBTCxDQUFTLFNBQVQsQ0FBbUIsTUFBbkIsRUFBMkIsSUFBM0IsQ0FBZ0MsU0FBUyxVQUF6QyxFQUFxRCxLQUFyRCxHQUE2RCxNQUE3RCxDQUFvRSxNQUFwRSxFQUE0RSxJQUE1RSxDQUFpRixHQUFqRixFQUFzRixVQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCO0FBQ3JHLGVBQU8sS0FBSyxNQUFMLEdBQWMsTUFBTSxLQUFLLFdBQWhDO0FBQ0QsT0FGRCxFQUVHLElBRkgsQ0FFUSxPQUZSLEVBRWlCLEtBQUssV0FGdEIsRUFFbUMsSUFGbkMsQ0FFd0MsUUFGeEMsRUFFa0QsS0FBSyxZQUFMLEdBQW9CLEdBRnRFLEVBRTJFLElBRjNFLENBRWdGLEdBRmhGLEVBRXFGLEtBQUssT0FGMUYsRUFFbUcsSUFGbkcsQ0FFd0csTUFGeEcsRUFFZ0gsVUFBUyxDQUFULEVBQVksR0FBWixFQUFpQjtBQUMvSCxlQUFPLEtBQUssTUFBTCxDQUFZLEdBQVosQ0FBUDtBQUNELE9BSkQsRUFJRyxJQUpILENBSVEsT0FKUixFQUlpQixRQUpqQixFQUkyQixFQUozQixDQUk4QixPQUo5QixFQUl1QyxVQUFTLENBQVQsRUFBWTtBQUNqRCxhQUFLLEdBQUwsQ0FBUyxNQUFULENBQWdCLGNBQWMsRUFBRSxJQUFoQixHQUF1QixTQUF2QyxFQUFrRCxJQUFsRCxHQUF5RCxhQUF6RCxDQUF1RSxJQUFJLFVBQUosQ0FBZSxPQUFmLENBQXZFO0FBQ0QsT0FORDs7QUFRQSxXQUFLLEdBQUwsQ0FBUyxTQUFULENBQW1CLGtCQUFuQixFQUF1QyxJQUF2QyxDQUE0QyxTQUFTLFVBQXJELEVBQWlFLEtBQWpFLEdBQXlFLE1BQXpFLENBQWdGLE1BQWhGLEVBQXdGLElBQXhGLENBQTZGLEdBQTdGLEVBQWtHLFVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUI7QUFDakgsZUFBTyxLQUFLLE1BQUwsR0FBYyxNQUFNLEtBQUssV0FBekIsR0FBdUMsS0FBSyxXQUFMLEdBQW1CLEdBQWpFO0FBQ0QsT0FGRCxFQUVHLElBRkgsQ0FFUSxNQUZSLEVBRWdCLFVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUI7QUFDL0IsZUFBTyxLQUFLLE1BQUwsQ0FBWSxHQUFaLENBQVA7QUFDRCxPQUpELEVBSUcsSUFKSCxDQUlRLEdBSlIsRUFJYSxLQUFLLE9BQUwsR0FBZSxLQUFLLFlBQUwsR0FBb0IsR0FKaEQsRUFJcUQsSUFKckQsQ0FJMEQsVUFBUyxDQUFULEVBQVk7QUFDcEUsZUFBTyxFQUFFLElBQVQ7QUFDRCxPQU5ELEVBTUcsSUFOSCxDQU1RLE9BTlIsRUFNaUIsYUFOakIsRUFNZ0MsSUFOaEMsQ0FNcUMsV0FOckMsRUFNa0QsS0FBSyxZQUFMLEdBQW9CLEdBTnRFLEVBTTJFLElBTjNFLENBTWdGLGFBTmhGLEVBTStGLFFBTi9GOztBQVFBLFdBQUssR0FBTCxDQUFTLFNBQVQsQ0FBbUIsY0FBbkIsRUFBbUMsSUFBbkMsQ0FBd0MsU0FBUyxVQUFqRCxFQUE2RCxLQUE3RCxHQUFxRSxNQUFyRSxDQUE0RSxNQUE1RSxFQUFvRixJQUFwRixDQUF5RixHQUF6RixFQUE4RixVQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCO0FBQzdHLGVBQU8sS0FBSyxNQUFMLEdBQWMsTUFBTSxLQUFLLFdBQXpCLEdBQXVDLEtBQUssV0FBTCxHQUFtQixHQUFqRTtBQUNELE9BRkQsRUFFRyxJQUZILENBRVEsR0FGUixFQUVhLEtBQUssT0FBTCxHQUFlLEtBQUssWUFBTCxHQUFvQixHQUFwQixHQUEwQixDQUZ0RCxFQUV5RCxJQUZ6RCxDQUU4RCxVQUFTLENBQVQsRUFBWTtBQUN4RSxlQUFPLEVBQUUsTUFBRixDQUFTLElBQVQsQ0FBYyxFQUFFLE1BQUYsQ0FBUyxJQUFULENBQWMsTUFBZCxHQUF1QixDQUFyQyxFQUF3QyxLQUEvQztBQUNELE9BSkQsRUFJRyxJQUpILENBSVEsT0FKUixFQUlpQixxQkFKakIsRUFJd0MsSUFKeEMsQ0FJNkMsTUFKN0MsRUFJcUQsVUFBUyxDQUFULEVBQVksR0FBWixFQUFpQjtBQUNwRSxlQUFPLEtBQUssTUFBTCxDQUFZLEdBQVosQ0FBUDtBQUNELE9BTkQsRUFNRyxJQU5ILENBTVEsV0FOUixFQU1xQixLQUFLLFlBQUwsR0FBb0IsR0FOekMsRUFNOEMsSUFOOUMsQ0FNbUQsYUFObkQsRUFNa0UsUUFObEU7O0FBUUE7QUFDQSxVQUFJLFlBQVksR0FBRyxJQUFILEdBQVUsQ0FBVixDQUFZLFVBQVMsQ0FBVCxFQUFZO0FBQ3RDLGVBQU8sT0FBTyxFQUFFLElBQUYsR0FBUyxJQUFoQixDQUFQO0FBQ0QsT0FGZSxFQUViLENBRmEsQ0FFWCxVQUFTLENBQVQsRUFBWTtBQUNmLGVBQU8sT0FBTyxFQUFFLFFBQUYsR0FBYSxHQUFwQixDQUFQO0FBQ0QsT0FKZSxDQUFoQjs7QUFNQSxlQUFTLFVBQVQsQ0FBb0IsT0FBcEIsQ0FBNEIsVUFBUyxJQUFULEVBQWUsS0FBZixFQUFzQjtBQUNoRCxZQUFJLElBQUksS0FBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFxQixJQUFyQixDQUEwQixPQUExQixFQUFtQyxhQUFhLEtBQUssSUFBckQsQ0FBUjtBQUNBLFVBQUUsTUFBRixDQUFTLE1BQVQsRUFBaUIsSUFBakIsQ0FBc0IsQ0FBQyxLQUFLLE1BQUwsQ0FBWSxJQUFiLENBQXRCLEVBQTBDLElBQTFDLENBQStDLE9BQS9DLEVBQXdELFlBQVksS0FBSyxJQUF6RSxFQUErRSxJQUEvRSxDQUFvRixHQUFwRixFQUF5RixTQUF6RixFQUFvRyxJQUFwRyxDQUF5RyxNQUF6RyxFQUFpSCxhQUFqSCxFQUFnSSxJQUFoSSxDQUFxSSxRQUFySSxFQUErSSxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQS9JLEVBQW1LLElBQW5LLENBQXdLLFdBQXhLLGlCQUFrTSxLQUFLLE1BQXZNLFNBQWlOLEtBQUssTUFBdE4sUUFBaU8sRUFBak8sQ0FBb08sT0FBcE8sRUFBNk8sV0FBN08sRUFBMFAsVUFBMVA7O0FBRUEsVUFBRSxTQUFGLENBQVksZUFBZSxLQUFLLElBQWhDLEVBQXNDLElBQXRDLENBQTJDLEtBQUssTUFBTCxDQUFZLElBQXZELEVBQTZELEtBQTdELEdBQXFFLE1BQXJFLENBQTRFLFFBQTVFLEVBQXNGLElBQXRGLENBQTJGLE9BQTNGLEVBQW9HLE9BQU8sS0FBSyxJQUFoSCxFQUFzSCxJQUF0SCxDQUEySCxJQUEzSCxFQUFpSSxVQUFTLENBQVQsRUFBWTtBQUMzSSxpQkFBTyxPQUFPLEVBQUUsSUFBRixHQUFTLElBQWhCLENBQVA7QUFDRCxTQUZELEVBRUcsSUFGSCxDQUVRLElBRlIsRUFFYyxVQUFTLENBQVQsRUFBWTtBQUN4QixpQkFBTyxPQUFPLEVBQUUsUUFBRixHQUFhLEdBQXBCLENBQVA7QUFDRCxTQUpELEVBSUcsSUFKSCxDQUlRLEdBSlIsRUFJYSxDQUpiLEVBSWdCLElBSmhCLENBSXFCLFdBSnJCLGlCQUkrQyxLQUFLLE1BSnBELFNBSThELEtBQUssTUFKbkUsUUFJOEUsSUFKOUUsQ0FJbUYsTUFKbkYsRUFJMkYsS0FBSyxNQUFMLENBQVksS0FBWixDQUozRixFQUkrRyxJQUovRyxDQUlvSCxRQUpwSCxFQUk4SCxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBSjlILEVBSWtKLFdBSmxKLEdBSWdLLEVBSmhLLENBSW1LLE9BSm5LLEVBSTRLLFdBSjVLLEVBSXlMLEVBSnpMLENBSTRMLFdBSjVMLEVBSXlNLFVBQVMsQ0FBVCxFQUFZO0FBQ25OLGFBQUcsTUFBSCxDQUFVLElBQVYsRUFBZ0IsSUFBaEIsQ0FBcUIsR0FBckIsRUFBMEIsQ0FBMUI7QUFDQSxlQUFLLEdBQUwsQ0FBUyxVQUFULEdBQXNCLFFBQXRCLENBQStCLEdBQS9CLEVBQW9DLEtBQXBDLENBQTBDLFNBQTFDLEVBQXFELE9BQXJELEVBQThELEtBQTlELENBQW9FLFNBQXBFLEVBQStFLEdBQS9FOztBQUVBLGVBQUssR0FBTCxDQUFTLElBQVQsQ0FBYyxTQUFTLFVBQVQsQ0FBb0IsS0FBcEIsRUFBMkIsSUFBM0IsR0FBa0MsUUFBbEMsR0FBNkMsRUFBRSxLQUEvQyxHQUF1RCxHQUF2RCxHQUE2RCxTQUFTLFNBQXRFLEdBQWtGLFFBQWxGLEdBQTZGLFdBQVcsSUFBSSxJQUFKLENBQVMsRUFBRSxJQUFGLEdBQVMsSUFBbEIsQ0FBWCxDQUEzRyxFQUFnSixLQUFoSixDQUFzSixVQUF0SixFQUFrSyxVQUFsSyxFQUE4SyxLQUE5SyxDQUFvTCxNQUFwTCxFQUE2TCxHQUFHLEtBQUgsQ0FBUyxLQUFWLEdBQW1CLElBQS9NLEVBQXFOLEtBQXJOLENBQTJOLEtBQTNOLEVBQW1PLEdBQUcsS0FBSCxDQUFTLEtBQVQsR0FBaUIsRUFBbEIsR0FBd0IsSUFBMVA7QUFDRCxTQVRELEVBU0csRUFUSCxDQVNNLFVBVE4sRUFTa0IsVUFBUyxDQUFULEVBQVk7QUFDNUIsYUFBRyxNQUFILENBQVUsSUFBVixFQUFnQixJQUFoQixDQUFxQixHQUFyQixFQUEwQixDQUExQjtBQUNBLGVBQUssR0FBTCxDQUFTLFVBQVQsR0FBc0IsUUFBdEIsQ0FBK0IsR0FBL0IsRUFBb0MsS0FBcEMsQ0FBMEMsU0FBMUMsRUFBcUQsQ0FBckQsRUFBd0QsS0FBeEQsQ0FBOEQsU0FBOUQsRUFBeUUsTUFBekU7QUFDRCxTQVpEO0FBYUQsT0FqQkQ7QUFrQkQ7OztrQ0E1SW9CLEcsRUFBSztBQUN4QixVQUFJLE9BQU8sQ0FBWDtBQUNBLFVBQUksSUFBSSxNQUFKLElBQWMsQ0FBbEIsRUFDRSxPQUFPLElBQVA7QUFDRixXQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksSUFBSSxNQUF4QixFQUFnQyxHQUFoQyxFQUFxQztBQUNuQyxZQUFJLE9BQU8sSUFBSSxVQUFKLENBQWUsQ0FBZixDQUFYO0FBQ0EsZUFBUSxDQUFDLFFBQVEsQ0FBVCxJQUFjLElBQWYsR0FBdUIsSUFBOUI7QUFDQSxlQUFPLE9BQU8sSUFBZCxDQUhtQyxDQUdmO0FBQ3JCOztBQUVELFVBQUksU0FBUyxDQUFDLFFBQUQsRUFBVyxRQUFYLEVBQXFCLFFBQXJCLENBQWI7O0FBRUEsYUFBUSxJQUFELEdBQVUsUUFBVixDQUFtQixzQkFBMUIsQ0Fad0IsQ0FZNEI7QUFDcEQsV0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLENBQXBCLEVBQXVCLEdBQXZCLEVBQTRCO0FBQzFCLGVBQU8sQ0FBUCxJQUFZLENBQUMsQ0FBQyxDQUFDLE9BQU8sT0FBTyxDQUFQLENBQVIsS0FBdUIsS0FBSyxJQUFJLENBQWpDLElBQXVDLElBQXhDLEVBQThDLFFBQTlDLENBQXVELEVBQXZELENBQVo7QUFDQSxlQUFPLENBQVAsSUFDRSxPQUFPLENBQVAsRUFBVSxNQUFWLElBQW9CLENBQXBCLEdBQ0EsTUFBTSxPQUFPLENBQVAsQ0FETixHQUVBLE9BQU8sQ0FBUCxDQUhGO0FBSUQ7QUFDRCxjQUFRLEdBQVIsQ0FBWSxHQUFaLEVBQWlCLE9BQ2YsT0FBTyxDQUFQLElBQVksT0FBTyxDQUFQLENBQVosR0FBd0IsT0FBTyxDQUFQLENBRFQsQ0FBakI7QUFFQSxhQUFRLE9BQ04sT0FBTyxDQUFQLElBQVksT0FBTyxDQUFQLENBQVosR0FBd0IsT0FBTyxDQUFQLENBRGxCLENBQVI7QUFFRDs7Ozs7Ozs7O3FqQkN4Rkg7O0FBRUE7QUFDQTtBQUNBOzs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQUVNLEk7QUFDSixrQkFBYztBQUFBO0FBQUU7Ozs7MkJBRVQ7QUFDTCxXQUFLLEdBQUwsR0FBVyxzQkFBWDs7QUFFQSxXQUFLLFFBQUwsR0FBZ0IsdUJBQWEsS0FBSyxHQUFsQixDQUFoQjs7QUFFQSxXQUFLLEdBQUwsQ0FBUyxRQUFULEdBQW9CLElBQXBCLENBQXlCLFVBQVMsSUFBVCxFQUFlO0FBQ3RDLFlBQUksT0FBTyxPQUFPLElBQVAsQ0FBWSxLQUFLLElBQWpCLENBQVg7QUFDQSxhQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksS0FBSyxNQUF6QixFQUFpQyxHQUFqQyxFQUFzQztBQUNwQyxZQUFFLGFBQUYsRUFBaUIsTUFBakIsc0JBQTBDLEtBQUssSUFBTCxDQUFVLEtBQUssQ0FBTCxDQUFWLEVBQW1CLFFBQTdEO0FBQ0Q7QUFDRixPQUxEOztBQU9BLFdBQUssYUFBTCxDQUFtQixLQUFLLFdBQUwsRUFBbkI7QUFDQSxXQUFLLGdCQUFMO0FBQ0EsV0FBSyxrQkFBTDtBQUNBLFdBQUssWUFBTDs7QUFFQSxXQUFLLGFBQUwsQ0FBbUIsS0FBSyxLQUF4QixFQUErQixLQUFLLFFBQXBDLEVBQThDLE9BQU8sVUFBckQsRUFBaUUsT0FBTyxXQUF4RTtBQUVEOzs7a0NBRWEsUyxFQUFXO0FBQ3ZCLFFBQUUsV0FBRixFQUFlLEtBQWY7QUFDQSxXQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksVUFBVSxNQUE5QixFQUFzQyxHQUF0QyxFQUEyQztBQUN6QyxhQUFLLHFCQUFMLENBQTJCLFVBQVUsQ0FBVixDQUEzQjtBQUNEO0FBQ0Y7OzttQ0FFYztBQUNiLFVBQUksZUFBZSxhQUFhLE9BQWIsQ0FBcUIsY0FBckIsQ0FBbkI7QUFDQSxVQUFJLENBQUMsWUFBTCxFQUFtQjtBQUNqQix1QkFBZSxZQUFmO0FBQ0EscUJBQWEsT0FBYixDQUFxQixjQUFyQixFQUFxQyxZQUFyQztBQUNEO0FBQ0Y7Ozt1Q0FFa0I7QUFDakIsVUFBSSxlQUFlLGFBQWEsT0FBYixDQUFxQixjQUFyQixDQUFuQjtBQUNBLFVBQUksQ0FBQyxZQUFMLEVBQW1CO0FBQ2pCLHVCQUFlLFlBQWY7QUFDQSxxQkFBYSxPQUFiLENBQXFCLGNBQXJCLEVBQXFDLEtBQXJDO0FBQ0Q7QUFDRCxRQUFFLHdCQUFGLEVBQTRCLE1BQTVCLENBQW1DLFlBQVc7QUFDNUMsZUFBTyxFQUFFLElBQUYsRUFBUSxJQUFSLE1BQWtCLFlBQXpCO0FBQ0QsT0FGRCxFQUVHLElBRkgsQ0FFUSxVQUZSLEVBRW9CLElBRnBCOztBQUlBLFdBQUssUUFBTCxDQUFjLFNBQWQsR0FBMEIsRUFBRSxpQkFBRixFQUFxQixHQUFyQixFQUExQjtBQUNEOzs7MENBQ3FCLEcsRUFBSztBQUN6QixVQUFJLE9BQU8sSUFBWDtBQUNBLFVBQUksVUFBVSxJQUFJLEtBQUosQ0FBVSxnQkFBVixDQUFkO0FBQ0EsVUFBSSxRQUFRLE1BQVIsR0FBaUIsQ0FBckIsRUFBd0I7QUFDdEI7QUFDRDtBQUNELFVBQUksV0FBVyxRQUFRLENBQVIsQ0FBZjtBQUNBLFVBQUksVUFBVSxRQUFRLENBQVIsRUFBVyxPQUFYLENBQW1CLEdBQW5CLEVBQXdCLEVBQXhCLENBQWQ7O0FBRUEsVUFBSSxFQUFFLGdCQUFnQixPQUFsQixFQUEyQixNQUEzQixLQUFzQyxDQUExQyxFQUE2QztBQUMzQyxVQUFFLFdBQUYsRUFBZSxNQUFmLGdCQUFtQyxPQUFuQyx5QkFBOEQsUUFBOUQsaUJBQWtGLFFBQWxGLDRCQUFpSCxPQUFqSDtBQUNBLFVBQUUsZ0JBQWdCLE9BQWxCLEVBQTJCLEdBQTNCLENBQStCLGtCQUEvQixFQUFtRCxxQkFBVSxhQUFWLENBQXdCLFVBQVUsR0FBVixHQUFnQixPQUF4QyxDQUFuRDs7QUFFQSxVQUFFLGdCQUFnQixPQUFsQixFQUEyQixLQUEzQixDQUFpQyxZQUFXO0FBQzFDLGVBQUssTUFBTDtBQUNBLGVBQUssa0JBQUw7QUFDQSxlQUFLLFFBQUwsQ0FBYyxRQUFkLENBQXVCLEtBQUssS0FBNUI7QUFDRCxTQUpEO0FBS0Q7QUFDRCx3QkFBZ0IsT0FBaEIsRUFBMkIsTUFBM0I7QUFDRDs7O2tDQUVhO0FBQ1osVUFBSSxVQUFVLGFBQWEsT0FBYixDQUFxQixZQUFyQixDQUFkO0FBQ0EsVUFBSSxDQUFDLE9BQUwsRUFBYztBQUNaLHFCQUFhLE9BQWIsQ0FBcUIsWUFBckIsRUFBbUMsQ0FBQyxlQUFELEVBQWtCLGVBQWxCLEVBQW1DLGdCQUFuQyxFQUFxRCxvQkFBckQsRUFBMkUsaUJBQTNFLENBQW5DO0FBQ0EsZUFBTyxpQkFBUDtBQUNELE9BSEQsTUFHTztBQUNMLFlBQUksUUFBUSxRQUFRLEtBQVIsQ0FBYyxHQUFkLENBQVo7QUFDQSxhQUFLLElBQUksQ0FBVCxJQUFjLEtBQWQsRUFBcUI7QUFDbkIsY0FBSSxNQUFNLENBQU4sRUFBUyxLQUFULENBQWUsZ0JBQWYsRUFBaUMsTUFBakMsR0FBMEMsQ0FBOUMsRUFBaUQ7QUFDL0MseUJBQWEsT0FBYixDQUFxQixZQUFyQixFQUFtQyxpQkFBbkM7QUFDQSxtQkFBTyxpQkFBUDtBQUNEO0FBQ0Y7QUFDRCxlQUFPLEtBQVA7QUFDRDtBQUNGOzs7eUNBRW9CO0FBQ25CLFVBQUksYUFBYSxFQUFqQjtBQUNBLFVBQUksZ0JBQWdCLEVBQXBCO0FBQ0EsUUFBRSxnQkFBRixFQUFvQixJQUFwQixDQUF5QixZQUFXO0FBQ2xDLHNCQUFjLEtBQUssRUFBTCxHQUFVLEdBQXhCO0FBQ0Esc0JBQWMsSUFBZCxDQUFtQixFQUFFLElBQUYsRUFBUSxJQUFSLENBQWEsVUFBYixXQUErQixLQUFLLEVBQXBDLE9BQW5CO0FBQ0QsT0FIRDtBQUlBLG1CQUFhLE9BQWIsQ0FBcUIsWUFBckIsRUFBbUMsYUFBbkM7O0FBRUEsbUJBQWEsV0FBVyxLQUFYLENBQWlCLENBQWpCLEVBQW9CLENBQUMsQ0FBckIsQ0FBYjtBQUNBLFdBQUssUUFBTCxDQUFjLGVBQWQsQ0FBOEIsVUFBOUI7QUFDRDs7O2tDQUVhLEssRUFBTyxRLEVBQVUsSyxFQUFPLE0sRUFBUTtBQUM1QyxVQUFJLE9BQU8sSUFBWDtBQUNBLFFBQUUsTUFBRixFQUFVLE1BQVYsQ0FBaUIsVUFBUyxLQUFULEVBQWdCO0FBQy9CLFlBQUksTUFBTSxNQUFOLElBQWdCLE1BQWhCLElBQTBCLEVBQUUsTUFBTSxNQUFSLEVBQWdCLElBQWhCLENBQXFCLGVBQXJCLEVBQXNDLE1BQXRDLEdBQStDLENBQTdFLEVBQWdGO0FBQzlFLGVBQUssWUFBTCxDQUFrQixNQUFNLE1BQXhCO0FBQ0Q7QUFDRixPQUpEOztBQU1BLFFBQUUsV0FBRixFQUFlLE1BQWYsQ0FBc0IsWUFBVztBQUMvQixhQUFLLHFCQUFMLENBQTJCLEVBQUUsV0FBRixFQUFlLEdBQWYsRUFBM0I7QUFDQSxhQUFLLGtCQUFMO0FBQ0EsYUFBSyxRQUFMLENBQWMsUUFBZCxDQUF1QixLQUFLLEtBQTVCO0FBQ0EsVUFBRSxXQUFGLEVBQWUsR0FBZixDQUFtQixFQUFuQjtBQUNELE9BTEQ7O0FBT0E7QUFDQSxZQUFNLCtCQUFOLEVBQXVDLElBQXZDLENBQTRDLFVBQVMsUUFBVCxFQUFtQjtBQUM3RCxlQUFPLFNBQVMsSUFBVCxFQUFQO0FBQ0QsT0FGRCxFQUVHLElBRkgsQ0FFUSxVQUFTLFdBQVQsRUFBc0I7QUFDNUIsZ0JBQVEsR0FBUixDQUFZLFdBQVo7QUFDQSxhQUFLLElBQUksQ0FBVCxJQUFjLFdBQWQsRUFBMkI7QUFDekIsWUFBRSxVQUFGLEVBQWMsTUFBZCxpQkFBbUMsWUFBWSxDQUFaLEVBQWUsRUFBbEQsbURBQWtHLFlBQVksQ0FBWixFQUFlLEVBQWpILGdDQUE4SSxZQUFZLENBQVosRUFBZSxPQUE3SjtBQUNBLFdBQUMsVUFBUyxDQUFULEVBQVk7QUFDWCxjQUFFLE1BQU0sWUFBWSxDQUFaLEVBQWUsRUFBdkIsRUFBMkIsS0FBM0IsQ0FBaUMsWUFBVztBQUMxQyx1QkFBUyxRQUFULENBQWtCLEtBQUssS0FBdkIsRUFBOEIsWUFBWSxDQUFaLEVBQWUsSUFBN0MsRUFBbUQsWUFBWSxDQUFaLEVBQWUsS0FBbEU7QUFDQSwyQkFBYSxPQUFiLENBQXFCLGNBQXJCLEVBQXFDLFlBQVksQ0FBWixFQUFlLEVBQXBEO0FBQ0QsYUFIRDtBQUlELFdBTEQsRUFLRyxDQUxIO0FBT0Q7QUFDRCxVQUFFLGdCQUFGLEVBQW9CLGFBQXBCLENBQWtDO0FBQ2hDLGdCQUFNLEtBRDBCO0FBRWhDLG1CQUFTO0FBQ1AsZ0NBQW9CO0FBRGI7QUFGdUIsU0FBbEM7O0FBT0EsVUFBRSxNQUFNLGFBQWEsT0FBYixDQUFxQixjQUFyQixDQUFSLEVBQThDLEtBQTlDO0FBRUQsT0F2QkQ7O0FBeUJBLFFBQUUsaUJBQUYsRUFBcUIsTUFBckIsQ0FBNEIsWUFBVztBQUNyQyxxQkFBYSxPQUFiLENBQXFCLGNBQXJCLEVBQXFDLEVBQUUsaUJBQUYsRUFBcUIsR0FBckIsRUFBckM7QUFDQSxpQkFBUyxTQUFULEdBQXFCLEVBQUUsaUJBQUYsRUFBcUIsR0FBckIsRUFBckI7QUFDQSxpQkFBUyxRQUFULENBQWtCLEtBQUssS0FBdkI7QUFDRCxPQUpEOztBQU1BLFVBQUksV0FBVyxFQUFFLGlCQUFGLEVBQXFCLE1BQXJCLENBQTRCO0FBQ3pDLHVCQUFlLEtBRDBCO0FBRXpDLGVBQU8sR0FGa0M7QUFHekMsZ0JBQVEsR0FIaUM7QUFJekMsa0JBQVUsR0FKK0I7QUFLekMscUJBQWEsVUFMNEI7QUFNekMsa0JBQVU7QUFDUixjQUFJLGFBREk7QUFFUixjQUFJLFVBRkk7QUFHUixjQUFJO0FBSEk7QUFOK0IsT0FBNUIsQ0FBZjs7QUFhQSxVQUFJLFdBQVcsT0FBTyxVQUFQLEdBQW9CLEdBQW5DO0FBQ0EsVUFBSSxZQUFZLE9BQU8sV0FBUCxHQUFxQixJQUFyQztBQUNBLFFBQUUsZUFBRixFQUFtQixNQUFuQixDQUEwQjtBQUN4Qix1QkFBZSxLQURTO0FBRXhCLGVBQU8sUUFGaUI7QUFHeEIsZ0JBQVEsU0FIZ0I7QUFJeEIscUJBQWEsVUFKVztBQUt4QixrQkFBVTtBQUNSLGNBQUksVUFESTtBQUVSLGNBQUksYUFGSTtBQUdSLGNBQUk7QUFISTtBQUxjLE9BQTFCOztBQVlBLFVBQUksTUFBTSxHQUFHLE1BQUgsQ0FBVSxlQUFWLEVBQTJCLE1BQTNCLENBQWtDLFNBQWxDLEVBQTZDLElBQTdDLENBQWtELElBQWxELEVBQXdELEtBQXhELENBQVY7QUFDQSxTQUFHLE1BQUgsQ0FBVSxLQUFWLEVBQWlCLElBQWpCLENBQXNCLE9BQXRCLEVBQWdDLFdBQVcsR0FBM0MsRUFBaUQsSUFBakQsQ0FBc0QsUUFBdEQsRUFBaUUsWUFBWSxFQUE3RTs7QUFFQSxXQUFLLEtBQUwsR0FBYSx5QkFBYyxHQUFkLEVBQW1CLEVBQW5CLEVBQXVCLEVBQXZCLEVBQTJCLENBQTNCLEVBQThCLEdBQTlCLEVBQW1DLEVBQW5DLEVBQXVDLFdBQVcsR0FBbEQsRUFBdUQsWUFBWSxFQUFuRSxDQUFiOztBQUVBLFFBQUUsU0FBRixFQUFhLE1BQWIsR0FBc0IsUUFBdEIsQ0FBK0IsRUFBRSxlQUFGLEVBQW1CLE1BQW5CLEdBQTRCLElBQTVCLENBQWlDLHNDQUFqQyxDQUEvQjtBQUNBLFFBQUUsU0FBRixFQUFhLE1BQWI7O0FBRUEsUUFBRSxpQkFBRixFQUFxQixNQUFyQjtBQUNBOztBQUVBLFFBQUUsU0FBRixFQUFhLEtBQWIsQ0FBbUIsWUFBVzs7QUFFNUIsWUFBSSxhQUFhLElBQUksYUFBSixFQUFqQjs7QUFFQSxZQUFJLElBQUksU0FBUyxhQUFULENBQXVCLEdBQXZCLENBQVI7QUFDQSxVQUFFLFFBQUYsR0FBYSxpQkFBYjtBQUNBLFVBQUUsSUFBRixHQUFTLGVBQVQ7QUFDQSxZQUFJLE9BQU8sSUFBSSxJQUFKLENBQVMsQ0FBQyw4Q0FBOEMsV0FBVyxpQkFBWCxDQUE2QixFQUFFLE1BQUYsRUFBVSxDQUFWLENBQTdCLENBQS9DLENBQVQsRUFBcUcsRUFBQyxRQUFRLGVBQVQsRUFBckcsQ0FBWDtBQUNBLFVBQUUsSUFBRixHQUFTLENBQUMsT0FBTyxHQUFQLElBQWMsU0FBZixFQUEwQixlQUExQixDQUEwQyxJQUExQyxDQUFUO0FBQ0EsVUFBRSxLQUFGO0FBQ0EsVUFBRSxDQUFGLEVBQUssTUFBTDtBQUVELE9BWkQ7QUFhRDs7O2lDQUVZLE0sRUFBUTtBQUNuQixTQUFHLE1BQUgsQ0FBVSxLQUFWLEVBQWlCLElBQWpCLENBQXNCLE9BQXRCLEVBQWdDLEVBQUUsTUFBRixFQUFVLEtBQVYsS0FBb0IsR0FBcEQsRUFBMEQsSUFBMUQsQ0FBK0QsUUFBL0QsRUFBMEUsRUFBRSxNQUFGLEVBQVUsTUFBVixLQUFxQixFQUEvRjtBQUNBLFdBQUssS0FBTCxDQUFXLE1BQVgsQ0FBa0IsRUFBbEIsRUFBc0IsRUFBdEIsRUFBMEIsQ0FBMUIsRUFBNkIsR0FBN0IsRUFBa0MsRUFBbEMsRUFBc0MsRUFBRSxNQUFGLEVBQVUsS0FBVixLQUFvQixHQUExRCxFQUErRCxFQUFFLE1BQUYsRUFBVSxNQUFWLEtBQXFCLEVBQXBGO0FBRUQ7Ozs7OztBQUdILEVBQUUsUUFBRixFQUFZLEtBQVosQ0FBa0IsWUFBVztBQUMzQixNQUFJLE9BQU8sSUFBSSxJQUFKLEVBQVg7QUFDQSxPQUFLLElBQUw7QUFDRCxDQUhEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCIvKiBqc2hpbnQgZXN2ZXJzaW9uOiA2ICovXG5cbmV4cG9ydCBjbGFzcyBDdXJyZW5jeUFQSSB7XG4gIGNvbnN0cnVjdG9yKCkge31cbiAgZ2V0SGlzdG9yaWNhbChob3Vyc09yTWludXRlcywgbmFtZSwgY29udmVyc2lvbiwgdmFsdWVzQ291bnQsIGNvdW50ZXIgPSAwKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChuYW1lID09IGNvbnZlcnNpb24pIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoc2VsZi5hbHdheXMxKGhvdXJzT3JNaW51dGVzLCB2YWx1ZXNDb3VudCkpO1xuICAgIH1cbiAgICByZXR1cm4gZmV0Y2goXCJodHRwczovL21pbi1hcGkuY3J5cHRvY29tcGFyZS5jb20vZGF0YS9oaXN0b1wiICsgaG91cnNPck1pbnV0ZXMgKyBcIj9mc3ltPVwiICsgbmFtZSArIFwiJnRzeW09XCIgKyBjb252ZXJzaW9uICsgXCImbGltaXQ9XCIgKyB2YWx1ZXNDb3VudCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICB9KS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGlmIChkYXRhLlJlc3BvbnNlID09IFwiRXJyb3JcIikge1xuICAgICAgICBpZiAoY291bnRlciA8IDUpIHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5nZXRIaXN0b3JpY2FsKGhvdXJzT3JNaW51dGVzLCBuYW1lLCBjb252ZXJzaW9uLCB2YWx1ZXNDb3VudCwgY291bnRlciArIDEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKGRhdGEpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0Q3VycmVudCgpIHt9XG5cbiAgZ2V0Q29pbnMoKSB7XG4gICAgcmV0dXJuIGZldGNoKFwiaHR0cHM6Ly9taW4tYXBpLmNyeXB0b2NvbXBhcmUuY29tL2RhdGEvYWxsL2NvaW5saXN0XCIpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgfSk7XG4gIH1cblxuICBhbHdheXMxKGhvdXJzT3JNaW51dGVzLCB2YWx1ZXNDb3VudCkge1xuICAgIGxldCBpbnRlcnZhbCA9IDYwO1xuICAgIGlmIChob3Vyc09yTWludXRlcyA9PSBcImhvdXJcIikge1xuICAgICAgaW50ZXJ2YWwgPSAzNjAwO1xuICAgIH1cbiAgICBpZiAoaG91cnNPck1pbnV0ZXMgPT0gXCJkYXlcIikge1xuICAgICAgaW50ZXJ2YWwgPSAzNjAwICogMjQ7XG4gICAgfVxuICAgIGxldCBjdXJyZW50VGltZSA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuICAgIGN1cnJlbnRUaW1lIC09IGN1cnJlbnRUaW1lICUgaW50ZXJ2YWw7XG4gICAgbGV0IHRpbWVGcm9tID0gY3VycmVudFRpbWUgLSBpbnRlcnZhbCAqIHZhbHVlc0NvdW50O1xuXG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBUaW1lVG86IGN1cnJlbnRUaW1lLFxuICAgICAgVGltZUZyb206IHRpbWVGcm9tLFxuICAgICAgRGF0YTogW1xuICAgICAgICB7XG4gICAgICAgICAgY2xvc2U6IDEsXG4gICAgICAgICAgdGltZTogdGltZUZyb21cbiAgICAgICAgfSwge1xuICAgICAgICAgIGNsb3NlOiAxLFxuICAgICAgICAgIHRpbWU6IGN1cnJlbnRUaW1lXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9O1xuICAgIHJldHVybiBkYXRhO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtDdXJyZW5jeUFQSX07XG4iLCIvKiBqc2hpbnQgZXN2ZXJzaW9uOiA2ICovXG5pbXBvcnQge0N1cnJlbmN5fSBmcm9tICcuL2N1cnJlbmN5LmpzJztcblxuZXhwb3J0IGNsYXNzIENvaW5saXN0IHtcbiAgY29uc3RydWN0b3IoYXBpKSB7XG4gICAgdGhpcy5teUN1cnIgPSBbXTtcbiAgICB0aGlzLmdyYXBoID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbmNpZXMgPSBbXTtcbiAgICB0aGlzLmhvdXJPck1pbiA9IFwibWludXRlXCI7XG4gICAgdGhpcy5jb3VudGVyID0gMDtcbiAgICB0aGlzLmNvbnZlcnRUbyA9IFwiVVNEXCI7XG4gICAgdGhpcy52YWx1ZXNDb3VudCA9IDcyMDtcbiAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgIHRoaXMuYXBpID0gYXBpO1xuICB9XG5cbiAgdXBncmFkZUN1cnJMaXN0KHN0cikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLm15Q3VyciA9IHN0ci5zcGxpdChcIixcIik7XG4gICAgdGhpcy5teUN1cnIubWFwKGZ1bmN0aW9uKHZhbCwgaW5kZXgpIHtcbiAgICAgIGlmICh2YWwgPT09IFwiXCIpIHtcbiAgICAgICAgc2VsZi5teUN1cnIuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHNob3dMYXN0KGdyYXBoLCBob3VyT3JNaW4gPSBudWxsLCB2YWx1ZXNDb3VudCA9IG51bGwpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXRoaXMuaXNMb2FkaW5nKSB7XG4gICAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmdyYXBoID0gZ3JhcGggfHwgdGhpcy5ncmFwaDtcblxuICAgIGlmICh0aGlzLmludGVydmFsKSB7XG4gICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xuICAgICAgdGhpcy5pbnRlcnZhbCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKGhvdXJPck1pbiAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5ob3VyT3JNaW4gPSBob3VyT3JNaW47XG4gICAgfVxuICAgIGlmICh2YWx1ZXNDb3VudCAhPT0gbnVsbCkge1xuICAgICAgdGhpcy52YWx1ZXNDb3VudCA9IHZhbHVlc0NvdW50O1xuICAgIH1cblxuICAgIHRoaXMuY291bnRlciA9IDA7XG5cbiAgICB0aGlzLmN1cnJlbmNpZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMubXlDdXJyKSB7XG4gICAgICB2YXIgY3VyciA9IG5ldyBDdXJyZW5jeSh0aGlzLm15Q3VycltpXSwgdGhpcy5jb252ZXJ0VG8pO1xuICAgICAgY3Vyci5nZXRIaXN0b3JpY0xhc3QodGhpcywgaSk7XG4gICAgICB0aGlzLmN1cnJlbmNpZXMucHVzaChjdXJyKTtcbiAgICB9XG5cbiAgICB2YXIgdGltZW91dCA9IDA7XG4gICAgaWYgKHRoaXMuaG91ck9yTWluID09IFwibWludXRlXCIpIHtcbiAgICAgIHRpbWVvdXQgPSA2MDAwMCAtIERhdGUubm93KCkgJSA2MDAwMDtcbiAgICAgIGlmICh0aW1lb3V0ID09IDApXG4gICAgICAgIHRpbWVvdXQgKz0gNjAwMDA7XG4gICAgICB9XG4gICAgaWYgKHRoaXMuaG91ck9yTWluID09IFwiaG91clwiKSB7XG4gICAgICB0aW1lb3V0ID0gMzYwMDAwMCAtIERhdGUubm93KCkgJSAzNjAwMDAwO1xuICAgICAgaWYgKHRpbWVvdXQgPT0gMClcbiAgICAgICAgdGltZW91dCArPSAzNjAwMDAwO1xuICAgICAgfVxuICAgIGlmICh0aGlzLmhvdXJPck1pbiAhPSBcImRheVwiKSB7XG4gICAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuc2hvd0xhc3QoZ3JhcGgpO1xuICAgICAgfSwgdGltZW91dCk7XG4gICAgfVxuICB9XG5cbiAgaW5jcmVhc2VDb3VudGVyKCkge1xuICAgIHRoaXMuY291bnRlcisrO1xuICAgIGlmICh0aGlzLmNvdW50ZXIgPj0gdGhpcy5teUN1cnIubGVuZ3RoKSB7XG4gICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5ncmFwaC5kcmF3R3JhcGgodGhpcywgdGhpcy5ob3VyT3JNaW4sIHRoaXMudmFsdWVzQ291bnQpO1xuICAgICAgdGhpcy5jb3VudGVyID0gMDtcbiAgICB9XG4gIH1cbn1cbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cbmV4cG9ydCBjbGFzcyBDdXJyZW5jeSB7XG4gIGNvbnN0cnVjdG9yKG5hbWUsIGNvbnYsIGxvbmcgPSBudWxsKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLmxvbmduYW1lID0gbG9uZyB8fCBuYW1lO1xuICAgIHRoaXMuY29udmVyc2lvbiA9IGNvbnY7XG4gICAgLy8gICAgdGhpcy5pbmRleCA9IDA7XG4gICAgdGhpcy5jb3VudGVyID0gMDtcbiAgICBzZWxmLnZhbHVlcyA9IFtdO1xuICB9XG5cbiAgZ2V0SGlzdG9yaWNMYXN0KGNvaW5saXN0LCBpbmQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLy90aGlzLmluZGV4ID0gaW5kO1xuXG4gICAgdmFyIGhvdXJzT3JNaW51dGVzID0gY29pbmxpc3QuaG91ck9yTWluO1xuXG4gICAgY29pbmxpc3QuYXBpLmdldEhpc3RvcmljYWwoaG91cnNPck1pbnV0ZXMsIHRoaXMubmFtZSwgdGhpcy5jb252ZXJzaW9uLCBjb2lubGlzdC52YWx1ZXNDb3VudCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICBzZWxmLnNhdmVHcmFwaChkYXRhKTtcbiAgICAgIGNvaW5saXN0LmluY3JlYXNlQ291bnRlcigpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgY29pbmxpc3QuaW5jcmVhc2VDb3VudGVyKCk7XG4gICAgfSk7XG4gIH1cblxuICBzYXZlR3JhcGgoZGF0YSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnZhbHVlcyA9IFtdO1xuICAgIGlmIChkYXRhLlJlc3BvbnNlID09IFwiRXJyb3JcIikge1xuICAgICAgY29uc29sZS5sb2codGhpcy5uYW1lICsgXCIgRXJyb3JcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2VsZi52YWx1ZXMubWF4ID0gZGF0YS5EYXRhLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gTWF0aC5tYXgoYSwgYi5jbG9zZSk7XG4gICAgfSwgMCk7XG5cbiAgICBzZWxmLnZhbHVlcy5taW4gPSBkYXRhLkRhdGEucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBNYXRoLm1pbihhLCBiLmNsb3NlKTtcbiAgICB9LCBzZWxmLnZhbHVlcy5tYXgpO1xuXG4gICAgc2VsZi52YWx1ZXMubWlkID0gKHNlbGYudmFsdWVzLm1heCArIHNlbGYudmFsdWVzLm1pbikgLyAyO1xuXG4gICAgc2VsZi52YWx1ZXMubWF4UmVsYXRpdmUgPSBzZWxmLnZhbHVlcy5tYXggLyBzZWxmLnZhbHVlcy5taWQgKiAxMDAgLSAxMDA7XG4gICAgc2VsZi52YWx1ZXMuZGF0YSA9IFtdO1xuICAgIHNlbGYudmFsdWVzLnRpbWVUbyA9IGRhdGEuVGltZVRvO1xuICAgIHNlbGYudmFsdWVzLnRpbWVGcm9tID0gZGF0YS5UaW1lRnJvbTtcblxuICAgIGZvciAobGV0IGkgaW4gZGF0YS5EYXRhKSB7XG4gICAgICBzZWxmLnZhbHVlcy5kYXRhLnB1c2goe1xuICAgICAgICBjbG9zZTogZGF0YS5EYXRhW2ldLmNsb3NlLFxuICAgICAgICByZWxhdGl2ZTogKGRhdGEuRGF0YVtpXS5jbG9zZSAtIHNlbGYudmFsdWVzLm1pZCkgLyBzZWxmLnZhbHVlcy5taWQgKiAxMDAsXG4gICAgICAgIHRpbWU6IGRhdGEuRGF0YVtpXS50aW1lXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3dia2QvZDMtZXh0ZW5kZWRcbmQzLnNlbGVjdGlvbi5wcm90b3R5cGUubW92ZVRvRnJvbnQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcyk7XG4gIH0pO1xufTtcbmQzLnNlbGVjdGlvbi5wcm90b3R5cGUubW92ZVRvQmFjayA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIHZhciBmaXJzdENoaWxkID0gdGhpcy5wYXJlbnROb2RlLmZpcnN0Q2hpbGQ7XG4gICAgaWYgKGZpcnN0Q2hpbGQpIHtcbiAgICAgIHRoaXMucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcywgZmlyc3RDaGlsZCk7XG4gICAgfVxuICB9KTtcbn07XG5cbmV4cG9ydCBjbGFzcyBEcmF3R3JhcGgge1xuICBjb25zdHJ1Y3RvcihzdmcsIHN0YXJ0WCwgc3RhcnRZLCBidXR0b25ZLCBidXR0V2lkdGgsIGJ1dHRIZWlnaHQsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICB0aGlzLnN2ZyA9IHN2ZztcbiAgICB0aGlzLnN0YXJ0WCA9IHN0YXJ0WDtcbiAgICB0aGlzLnN0YXJ0WSA9IHN0YXJ0WTtcbiAgICB0aGlzLmJ1dHRvblkgPSBidXR0b25ZO1xuICAgIHRoaXMuYnV0dG9uV2lkdGggPSBidXR0V2lkdGg7XG4gICAgdGhpcy5idXR0b25IZWlnaHQgPSBidXR0SGVpZ2h0O1xuXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgLSBzdGFydFkgKiAyIC0gMTA7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoIC0gc3RhcnRYIC0gMTA7XG5cbiAgICB0aGlzLmRpdiA9IGQzLnNlbGVjdChcImJvZHlcIikuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJjbGFzc1wiLCBcInRvb2x0aXBcIikuc3R5bGUoXCJvcGFjaXR5XCIsIDApO1xuICAgIHRoaXMucmVzZXRQYXBlcigpO1xuICB9XG5cbiAgcmVzaXplKHN0YXJ0WCwgc3RhcnRZLCBidXR0b25ZLCBidXR0V2lkdGgsIGJ1dHRIZWlnaHQsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICB0aGlzLnN0YXJ0WCA9IHN0YXJ0WDtcbiAgICB0aGlzLnN0YXJ0WSA9IHN0YXJ0WTtcbiAgICB0aGlzLmJ1dHRvblkgPSBidXR0b25ZO1xuICAgIHRoaXMuYnV0dG9uV2lkdGggPSBidXR0V2lkdGg7XG4gICAgdGhpcy5idXR0b25IZWlnaHQgPSBidXR0SGVpZ2h0O1xuXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgLSBzdGFydFkgKiAyIC0gMTA7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoIC0gc3RhcnRYIC0gMTA7XG5cbiAgICB0aGlzLmRyYXdHcmFwaCgpO1xuICB9XG5cbiAgcmVzZXRQYXBlcigpIHtcbiAgICB0aGlzLnJlc2V0R3JhcGgoKTtcbiAgICB0aGlzLmNvbG9ycyA9IFtdO1xuICB9XG5cbiAgcmVzZXRHcmFwaCgpIHtcbiAgICB0aGlzLnN2Zy5zZWxlY3RBbGwoXCIqXCIpLnJlbW92ZSgpO1xuICB9XG5cbiAgaW5pdENvbG9ycyhjdXJyZW5jaWVzLCBzaXplKSB7XG5cbiAgICBjb25zb2xlLmxvZyhjdXJyZW5jaWVzLCBzaXplKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuXG4gICAgICB0aGlzLmNvbG9yc1tpXSA9IERyYXdHcmFwaC5nZW5lcmF0ZUNvbG9yKGN1cnJlbmNpZXNbaV0ubmFtZSArIFwiL1wiICsgY3VycmVuY2llc1tpXS5uYW1lKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZ2VuZXJhdGVDb2xvcihzdHIpIHtcbiAgICBsZXQgaGFzaCA9IDA7XG4gICAgaWYgKHN0ci5sZW5ndGggPT0gMClcbiAgICAgIHJldHVybiBoYXNoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgY2hhciA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgaGFzaCA9ICgoaGFzaCA8PCA1KSAtIGhhc2gpICsgY2hhcjtcbiAgICAgIGhhc2ggPSBoYXNoICYgaGFzaDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXG4gICAgfVxuXG4gICAgdmFyIGNvbG9ycyA9IFsweDk5MDAwMCwgMHgwMDk5MDAsIDB4MDAwMDk5XTtcblxuICAgIGhhc2ggPSAoaGFzaCkgJSAoMTY3NzcyMTYgLyogMjA5NzE1MiAxNjc3NzIxNiAqLyApOyAvL1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgMzsgaisrKSB7XG4gICAgICBjb2xvcnNbal0gPSAoKChoYXNoICYgY29sb3JzW2pdKSA+PiAoMTYgLSBqICogOCkpICsgMHgyMikudG9TdHJpbmcoMTYpO1xuICAgICAgY29sb3JzW2pdID0gKFxuICAgICAgICBjb2xvcnNbal0ubGVuZ3RoID09IDEgP1xuICAgICAgICBcIjBcIiArIGNvbG9yc1tqXSA6XG4gICAgICAgIGNvbG9yc1tqXSk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKHN0ciwgXCIjXCIgKyAoXG4gICAgICBjb2xvcnNbMF0gKyBjb2xvcnNbMV0gKyBjb2xvcnNbMl0pKTtcbiAgICByZXR1cm4gKFwiI1wiICsgKFxuICAgICAgY29sb3JzWzBdICsgY29sb3JzWzFdICsgY29sb3JzWzJdKSk7XG4gIH1cblxuICBkcmF3R3JhcGgoY29pbmxpc3QpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKGNvaW5saXN0KSB7XG4gICAgICB0aGlzLmNvaW5saXN0ID0gY29pbmxpc3Q7XG4gICAgfVxuICAgIGlmICghY29pbmxpc3QpIHtcbiAgICAgIGNvaW5saXN0ID0gdGhpcy5jb2lubGlzdDtcbiAgICB9XG4gICAgaWYgKCFjb2lubGlzdCB8fCBjb2lubGlzdC5pc0xvYWRpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnJlc2V0UGFwZXIoKTtcblxuICAgIHRoaXMuaW5pdENvbG9ycyhjb2lubGlzdC5jdXJyZW5jaWVzLCBjb2lubGlzdC5jdXJyZW5jaWVzLmxlbmd0aCk7XG5cbiAgICB2YXIgbWF4VmFsID0gY29pbmxpc3QuY3VycmVuY2llcy5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KGEsIGIudmFsdWVzLm1heFJlbGF0aXZlKTtcbiAgICB9LCAwKTtcblxuICAgIHZhciB0aW1lRnJvbSA9IGNvaW5saXN0LmN1cnJlbmNpZXMucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBNYXRoLm1pbihhLCBiLnZhbHVlcy50aW1lRnJvbSk7XG4gICAgfSwgTnVtYmVyLk1BWF9WQUxVRSk7XG5cbiAgICB2YXIgdGltZVRvID0gY29pbmxpc3QuY3VycmVuY2llcy5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KGEsIGIudmFsdWVzLnRpbWVUbyk7XG4gICAgfSwgMCk7XG5cbiAgICB2YXIgc2NhbGVZID0gZDMuc2NhbGVMaW5lYXIoKS5kb21haW4oW1xuICAgICAgMTAwICsgbWF4VmFsLFxuICAgICAgMTAwIC0gbWF4VmFsXG4gICAgXSkucmFuZ2UoWzAsIHRoaXMuaGVpZ2h0XSk7XG5cbiAgICB2YXIgc2NhbGVYID0gZDMuc2NhbGVUaW1lKCkuZG9tYWluKFtcbiAgICAgIG5ldyBEYXRlKHRpbWVGcm9tICogMTAwMCAtIDEpLFxuICAgICAgbmV3IERhdGUodGltZVRvICogMTAwMCArIDEpXG4gICAgXSkucmFuZ2UoWzAsIHRoaXMud2lkdGhdKTtcblxuICAgIHZhciB0aW1lRm9ybWF0ID0gZDMudGltZUZvcm1hdChcIiVIOiVNICVkLSVtLSVZXCIpO1xuXG4gICAgdmFyIHlfYXhpcyA9IGQzLmF4aXNMZWZ0KCkudGlja3MoMjApLnNjYWxlKHNjYWxlWSk7XG4gICAgdmFyIHhfYXhpcyA9IGQzLmF4aXNCb3R0b20oKS50aWNrcygyMCkudGlja0Zvcm1hdCh0aW1lRm9ybWF0KS5zY2FsZShzY2FsZVgpO1xuXG4gICAgdGhpcy5zdmcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHt0aGlzLnN0YXJ0WH0sJHt0aGlzLnN0YXJ0WX0pYCkuY2FsbCh5X2F4aXMpO1xuICAgIHRoaXMuc3ZnLmFwcGVuZChcImdcIikuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7dGhpcy5zdGFydFh9LCAke3RoaXMuaGVpZ2h0ICsgdGhpcy5zdGFydFl9KWApLmNhbGwoeF9heGlzKS5zZWxlY3RBbGwoXCJ0ZXh0XCIpLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgXCJlbmRcIikudGV4dChmdW5jdGlvbihkKSB7XG4gICAgICB2YXIgdCA9IGQzLnNlbGVjdCh0aGlzLnBhcmVudE5vZGUpLmFwcGVuZChcInRleHRcIikuc3R5bGUoXCJ0ZXh0LWFuY2hvclwiLCBcImVuZFwiKS5hdHRyKFwiZmlsbFwiLCBcImJsYWNrXCIpLnRleHQodGltZUZvcm1hdChkKS50b1N0cmluZygpLnNwbGl0KFwiIFwiKVswXSkuYXR0cihcImR4XCIsIFwiLTEuOGVtXCIpLmF0dHIoXCJkeVwiLCBcIi4xNWVtXCIpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJyb3RhdGUoLTY1KVwiKTtcbiAgICAgIHJldHVybiB0aW1lRm9ybWF0KGQpLnRvU3RyaW5nKCkuc3BsaXQoXCIgXCIpWzFdO1xuICAgIH0pLmF0dHIoXCJkeFwiLCBcIi0uOGVtXCIpLmF0dHIoXCJkeVwiLCBcIi4xNWVtXCIpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJyb3RhdGUoLTY1KVwiKTtcblxuICAgIC8vIGFkZCB0aGUgWCBncmlkbGluZXNcbiAgICB0aGlzLnN2Zy5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImdyaWRcIikuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7c2VsZi5zdGFydFh9LCAke3NlbGYuaGVpZ2h0ICsgc2VsZi5zdGFydFl9KWApLmNhbGwoZDMuYXhpc0JvdHRvbShzY2FsZVgpLnRpY2tzKDEwKS50aWNrU2l6ZSgtc2VsZi5oZWlnaHQpLnRpY2tGb3JtYXQoXCJcIikpO1xuXG4gICAgLy8gYWRkIHRoZSBZIGdyaWRsaW5lc1xuICAgIHRoaXMuc3ZnLmFwcGVuZChcImdcIikuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7c2VsZi5zdGFydFh9LCAke3NlbGYuc3RhcnRZfSlgKS5hdHRyKFwiY2xhc3NcIiwgXCJncmlkXCIpLmNhbGwoZDMuYXhpc0xlZnQoc2NhbGVZKS50aWNrcyg1KS50aWNrU2l6ZSgtc2VsZi53aWR0aCAtIHNlbGYuc3RhcnRYKS50aWNrRm9ybWF0KFwiXCIpKTtcblxuICAgIHZhciBzZWxlY3RDbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGQzLnNlbGVjdCh0aGlzLnBhcmVudE5vZGUpLnN0eWxlKFwib3BhY2l0eVwiKSA9PSAxKSB7XG4gICAgICAgIGQzLnNlbGVjdEFsbChcIi5ncmFwaFwiKS5zdHlsZShcIm9wYWNpdHlcIiwgMC45OSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkMy5zZWxlY3RBbGwoXCIuZ3JhcGhcIikuc3R5bGUoXCJvcGFjaXR5XCIsIDAuMSk7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzLnBhcmVudE5vZGUpLnN0eWxlKFwib3BhY2l0eVwiLCAxKS5tb3ZlVG9Gcm9udCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvL2FkZCB0ZXh0IGJ1dHRvbnNcbiAgICB0aGlzLnN2Zy5zZWxlY3RBbGwoXCJyZWN0XCIpLmRhdGEoY29pbmxpc3QuY3VycmVuY2llcykuZW50ZXIoKS5hcHBlbmQoXCJyZWN0XCIpLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uKGQsIGluZCkge1xuICAgICAgcmV0dXJuIHNlbGYuc3RhcnRYICsgaW5kICogc2VsZi5idXR0b25XaWR0aDtcbiAgICB9KS5hdHRyKFwid2lkdGhcIiwgc2VsZi5idXR0b25XaWR0aCkuYXR0cihcImhlaWdodFwiLCBzZWxmLmJ1dHRvbkhlaWdodCAqIDEuOCkuYXR0cihcInlcIiwgc2VsZi5idXR0b25ZKS5hdHRyKFwiZmlsbFwiLCBmdW5jdGlvbihkLCBpbmQpIHtcbiAgICAgIHJldHVybiBzZWxmLmNvbG9yc1tpbmRdO1xuICAgIH0pLmF0dHIoXCJjbGFzc1wiLCBcImJ1dHRvblwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgIHNlbGYuc3ZnLnNlbGVjdChcIi5ncmFwaC5jX1wiICsgZC5uYW1lICsgXCIgPiBwYXRoXCIpLm5vZGUoKS5kaXNwYXRjaEV2ZW50KG5ldyBNb3VzZUV2ZW50KFwiY2xpY2tcIikpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zdmcuc2VsZWN0QWxsKFwidGV4dC5idXR0b25MYWJlbFwiKS5kYXRhKGNvaW5saXN0LmN1cnJlbmNpZXMpLmVudGVyKCkuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwieFwiLCBmdW5jdGlvbihkLCBpbmQpIHtcbiAgICAgIHJldHVybiBzZWxmLnN0YXJ0WCArIGluZCAqIHNlbGYuYnV0dG9uV2lkdGggKyBzZWxmLmJ1dHRvbldpZHRoICogMC41O1xuICAgIH0pLmF0dHIoXCJmaWxsXCIsIGZ1bmN0aW9uKGQsIGluZCkge1xuICAgICAgcmV0dXJuIHNlbGYuY29sb3JzW2luZF07XG4gICAgfSkuYXR0cihcInlcIiwgc2VsZi5idXR0b25ZICsgc2VsZi5idXR0b25IZWlnaHQgKiAwLjYpLnRleHQoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGQubmFtZTtcbiAgICB9KS5hdHRyKFwiY2xhc3NcIiwgXCJidXR0b25MYWJlbFwiKS5hdHRyKFwiZm9udC1zaXplXCIsIHNlbGYuYnV0dG9uSGVpZ2h0ICogMC42KS5hdHRyKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIik7XG5cbiAgICB0aGlzLnN2Zy5zZWxlY3RBbGwoXCJ0ZXh0LmNhcHRpb25cIikuZGF0YShjb2lubGlzdC5jdXJyZW5jaWVzKS5lbnRlcigpLmFwcGVuZChcInRleHRcIikuYXR0cihcInhcIiwgZnVuY3Rpb24oZCwgaW5kKSB7XG4gICAgICByZXR1cm4gc2VsZi5zdGFydFggKyBpbmQgKiBzZWxmLmJ1dHRvbldpZHRoICsgc2VsZi5idXR0b25XaWR0aCAqIDAuNTtcbiAgICB9KS5hdHRyKFwieVwiLCBzZWxmLmJ1dHRvblkgKyBzZWxmLmJ1dHRvbkhlaWdodCAqIDAuNiAqIDIpLnRleHQoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGQudmFsdWVzLmRhdGFbZC52YWx1ZXMuZGF0YS5sZW5ndGggLSAxXS5jbG9zZTtcbiAgICB9KS5hdHRyKFwiY2xhc3NcIiwgXCJidXR0b25MYWJlbCBjYXB0aW9uXCIpLmF0dHIoXCJmaWxsXCIsIGZ1bmN0aW9uKGQsIGluZCkge1xuICAgICAgcmV0dXJuIHNlbGYuY29sb3JzW2luZF07XG4gICAgfSkuYXR0cihcImZvbnQtc2l6ZVwiLCBzZWxmLmJ1dHRvbkhlaWdodCAqIDAuNikuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpO1xuXG4gICAgLy9kcmF3Z3JhcGhcbiAgICB2YXIgdmFsdWVsaW5lID0gZDMubGluZSgpLngoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIHNjYWxlWChkLnRpbWUgKiAxMDAwKTtcbiAgICB9KS55KGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBzY2FsZVkoZC5yZWxhdGl2ZSArIDEwMCk7XG4gICAgfSk7XG5cbiAgICBjb2lubGlzdC5jdXJyZW5jaWVzLmZvckVhY2goZnVuY3Rpb24oY3VyciwgaW5kZXgpIHtcbiAgICAgIGxldCBnID0gc2VsZi5zdmcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJncmFwaCBjX1wiICsgY3Vyci5uYW1lKTtcbiAgICAgIGcuYXBwZW5kKFwicGF0aFwiKS5kYXRhKFtjdXJyLnZhbHVlcy5kYXRhXSkuYXR0cihcImNsYXNzXCIsIFwicGF0aCBjX1wiICsgY3Vyci5uYW1lKS5hdHRyKFwiZFwiLCB2YWx1ZWxpbmUpLmF0dHIoXCJmaWxsXCIsIFwidHJhbnNwYXJlbnRcIikuYXR0cihcInN0cm9rZVwiLCBzZWxmLmNvbG9yc1tpbmRleF0pLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgke3NlbGYuc3RhcnRYfSwke3NlbGYuc3RhcnRZfSlgKS5vbihcImNsaWNrXCIsIHNlbGVjdENsaWNrKS5tb3ZlVG9CYWNrKCk7XG5cbiAgICAgIGcuc2VsZWN0QWxsKFwiY2lyY2xlIC5jX1wiICsgY3Vyci5uYW1lKS5kYXRhKGN1cnIudmFsdWVzLmRhdGEpLmVudGVyKCkuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJjbGFzc1wiLCBcImNfXCIgKyBjdXJyLm5hbWUpLmF0dHIoXCJjeFwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBzY2FsZVgoZC50aW1lICogMTAwMCk7XG4gICAgICB9KS5hdHRyKFwiY3lcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gc2NhbGVZKGQucmVsYXRpdmUgKyAxMDApO1xuICAgICAgfSkuYXR0cihcInJcIiwgMSkuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7c2VsZi5zdGFydFh9LCR7c2VsZi5zdGFydFl9KWApLmF0dHIoXCJmaWxsXCIsIHNlbGYuY29sb3JzW2luZGV4XSkuYXR0cihcInN0cm9rZVwiLCBzZWxmLmNvbG9yc1tpbmRleF0pLm1vdmVUb0Zyb250KCkub24oXCJjbGlja1wiLCBzZWxlY3RDbGljaykub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICBkMy5zZWxlY3QodGhpcykuYXR0cihcInJcIiwgNCk7XG4gICAgICAgIHNlbGYuZGl2LnRyYW5zaXRpb24oKS5kdXJhdGlvbigyMDApLnN0eWxlKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpLnN0eWxlKFwib3BhY2l0eVwiLCAwLjkpO1xuXG4gICAgICAgIHNlbGYuZGl2Lmh0bWwoY29pbmxpc3QuY3VycmVuY2llc1tpbmRleF0ubmFtZSArIFwiPGJyIFxcPlwiICsgZC5jbG9zZSArIFwiIFwiICsgY29pbmxpc3QuY29udmVydFRvICsgXCI8YnIgXFw+XCIgKyB0aW1lRm9ybWF0KG5ldyBEYXRlKGQudGltZSAqIDEwMDApKSkuc3R5bGUoXCJwb3NpdGlvblwiLCBcImFic29sdXRlXCIpLnN0eWxlKFwibGVmdFwiLCAoZDMuZXZlbnQucGFnZVgpICsgXCJweFwiKS5zdHlsZShcInRvcFwiLCAoZDMuZXZlbnQucGFnZVkgLSA2NSkgKyBcInB4XCIpO1xuICAgICAgfSkub24oXCJtb3VzZW91dFwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiclwiLCAxKTtcbiAgICAgICAgc2VsZi5kaXYudHJhbnNpdGlvbigpLmR1cmF0aW9uKDUwMCkuc3R5bGUoXCJvcGFjaXR5XCIsIDApLnN0eWxlKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG59IiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG4vLyBUT0RPOiBBZGQgcHJvbWlzZXMgZXZlcnl3aGVyZVxuLy8gVE9ETzogQ2xlYW4gdW5uZWNlc3NhcnkgalF1ZXJ5XG4vLyBUT0RPOiBNdWx0aXBsZSB3aW5kb3dzIGltcG9ydCB7Q3VycmVuY3lBUEl9IGZyb20gJy4vYXBpLmpzJztcbmltcG9ydCB7Q3VycmVuY3lBUEl9IGZyb20gJy4vYXBpLmpzJztcbmltcG9ydCB7Q29pbmxpc3R9IGZyb20gJy4vY29pbmxpc3QuanMnO1xuaW1wb3J0IHtDdXJyZW5jeX0gZnJvbSAnLi9jdXJyZW5jeS5qcyc7XG5pbXBvcnQge0RyYXdHcmFwaH0gZnJvbSAnLi9kcmF3R3JhcGguanMnO1xuXG5jbGFzcyBNYWluIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIGluaXQoKSB7XG4gICAgdGhpcy5hcGkgPSBuZXcgQ3VycmVuY3lBUEkoKTtcblxuICAgIHRoaXMuY29pbkxpc3QgPSBuZXcgQ29pbmxpc3QodGhpcy5hcGkpO1xuXG4gICAgdGhpcy5hcGkuZ2V0Q29pbnMoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZGF0YS5EYXRhKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAkKFwiI2N1cnJlbmNpZXNcIikuYXBwZW5kKGA8b3B0aW9uIHZhbHVlPScke2RhdGEuRGF0YVtrZXlzW2ldXS5GdWxsTmFtZX0nPjwvb3B0aW9uPmApO1xuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLmFkZEN1cnJlbmNpZXModGhpcy5sb2FkU3RvcmFnZSgpKTtcbiAgICB0aGlzLmV4Y2hhbmdlQ3VycmVuY3koKTtcbiAgICB0aGlzLnVwZGF0ZUN1cnJlbmN5TGlzdCgpO1xuICAgIHRoaXMuc2VsZWN0ZWRUaW1lKCk7XG5cbiAgICB0aGlzLmluaXRJbnRlcmZhY2UodGhpcy5ncmFwaCwgdGhpcy5jb2luTGlzdCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG5cbiAgfVxuXG4gIGFkZEN1cnJlbmNpZXMoY3VyckFycmF5KSB7XG4gICAgJChcIiNjdXJybGlzdFwiKS5lbXB0eSgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY3VyckFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLmFkZEN1cnJlbmN5RnJvbVN0cmluZyhjdXJyQXJyYXlbaV0pO1xuICAgIH1cbiAgfVxuXG4gIHNlbGVjdGVkVGltZSgpIHtcbiAgICBsZXQgdGltZUludGVydmFsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0aW1lSW50ZXJ2YWxcIik7XG4gICAgaWYgKCF0aW1lSW50ZXJ2YWwpIHtcbiAgICAgIHRpbWVJbnRlcnZhbCA9IFwic2hvdzEySG91clwiO1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0aW1lSW50ZXJ2YWxcIiwgXCJzaG93MTJIb3VyXCIpO1xuICAgIH1cbiAgfVxuXG4gIGV4Y2hhbmdlQ3VycmVuY3koKSB7XG4gICAgbGV0IGV4Y2hhbmdlQ3VyciA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiZXhjaGFuZ2VDdXJyXCIpO1xuICAgIGlmICghZXhjaGFuZ2VDdXJyKSB7XG4gICAgICBleGNoYW5nZUN1cnIgPSBcInNob3cxMkhvdXJcIjtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiZXhjaGFuZ2VDdXJyXCIsIFwiVVNEXCIpO1xuICAgIH1cbiAgICAkKFwiI2Nob29zZUN1cnJlbmN5IG9wdGlvblwiKS5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJCh0aGlzKS50ZXh0KCkgPT0gZXhjaGFuZ2VDdXJyO1xuICAgIH0pLnByb3AoJ3NlbGVjdGVkJywgdHJ1ZSk7XG5cbiAgICB0aGlzLmNvaW5MaXN0LmNvbnZlcnRUbyA9ICQoXCIjY2hvb3NlQ3VycmVuY3lcIikudmFsKCk7XG4gIH1cbiAgYWRkQ3VycmVuY3lGcm9tU3RyaW5nKHN0cikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgc3RyaW5ncyA9IHN0ci5tYXRjaCgvKC4qKVxcKCguKilcXCkuKi8pO1xuICAgIGlmIChzdHJpbmdzLmxlbmd0aCA8IDMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGN1cnJOYW1lID0gc3RyaW5nc1sxXTtcbiAgICB2YXIgbmV3Q3VyciA9IHN0cmluZ3NbMl0ucmVwbGFjZShcIipcIiwgXCJcIik7XG5cbiAgICBpZiAoJChcIiNjdXJybGlzdD4jXCIgKyBuZXdDdXJyKS5sZW5ndGggPT09IDApIHtcbiAgICAgICQoXCIjY3Vycmxpc3RcIikuYXBwZW5kKGA8c3BhbiBpZD1cIiR7bmV3Q3Vycn1cIiBkYXRhLWxvbmduYW1lPVwiJHtjdXJyTmFtZX1cIiB0aXRsZT1cIiR7Y3Vyck5hbWV9IC0gY2xpY2sgdG8gcmVtb3ZlXCI+JHtuZXdDdXJyfTwvc3Bhbj5gKTtcbiAgICAgICQoXCIjY3Vycmxpc3Q+I1wiICsgbmV3Q3VycikuY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiLCBEcmF3R3JhcGguZ2VuZXJhdGVDb2xvcihuZXdDdXJyICsgXCIvXCIgKyBuZXdDdXJyKSk7XG5cbiAgICAgICQoXCIjY3Vycmxpc3Q+I1wiICsgbmV3Q3VycikuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgIHNlbGYudXBkYXRlQ3VycmVuY3lMaXN0KCk7XG4gICAgICAgIHNlbGYuY29pbkxpc3Quc2hvd0xhc3Qoc2VsZi5ncmFwaCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgJChgI2N1cnJsaXN0PiMke25ld0N1cnJ9YCkuYnV0dG9uKCk7XG4gIH1cblxuICBsb2FkU3RvcmFnZSgpIHtcbiAgICB2YXIgc3RvcmFnZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiY3VycmVuY2llc1wiKTtcbiAgICBpZiAoIXN0b3JhZ2UpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiY3VycmVuY2llc1wiLCBbXCJCaXRjb2luIChCVEMpXCIsIFwiRXRoZXJ1bSAoRVRIKVwiLCBcIkxpdGVjb2luIChMVEMpXCIsIFwiRGlnaXRhbENhc2ggKERBU0gpXCIsIFwiRG9nZWNvaW4gKERPR0UpXCJdKTtcbiAgICAgIHJldHVybiBpbml0aWFsQ3VycmVuY2llcztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGFycmF5ID0gc3RvcmFnZS5zcGxpdChcIixcIik7XG4gICAgICBmb3IgKHZhciBpIGluIGFycmF5KSB7XG4gICAgICAgIGlmIChhcnJheVtpXS5tYXRjaCgvKC4qKVxcKCguKilcXCkuKi8pLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImN1cnJlbmNpZXNcIiwgaW5pdGlhbEN1cnJlbmNpZXMpO1xuICAgICAgICAgIHJldHVybiBpbml0aWFsQ3VycmVuY2llcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZUN1cnJlbmN5TGlzdCgpIHtcbiAgICB2YXIgY3VyclN0cmluZyA9IFwiXCI7XG4gICAgdmFyIGN1cnJlbmN5TmFtZXMgPSBbXTtcbiAgICAkKFwiI2N1cnJsaXN0PnNwYW5cIikuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIGN1cnJTdHJpbmcgKz0gdGhpcy5pZCArIFwiLFwiO1xuICAgICAgY3VycmVuY3lOYW1lcy5wdXNoKCQodGhpcykuZGF0YShcImxvbmduYW1lXCIpICsgYCgke3RoaXMuaWR9KWApO1xuICAgIH0pO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiY3VycmVuY2llc1wiLCBjdXJyZW5jeU5hbWVzKTtcblxuICAgIGN1cnJTdHJpbmcgPSBjdXJyU3RyaW5nLnNsaWNlKDAsIC0xKTtcbiAgICB0aGlzLmNvaW5MaXN0LnVwZ3JhZGVDdXJyTGlzdChjdXJyU3RyaW5nKTtcbiAgfVxuXG4gIGluaXRJbnRlcmZhY2UoZ3JhcGgsIGNvaW5MaXN0LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC50YXJnZXQgIT0gd2luZG93ICYmICQoZXZlbnQudGFyZ2V0KS5maW5kKFwiLnJlbmRlckNhbnZhc1wiKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNlbGYucmVzaXplV2luZG93KGV2ZW50LnRhcmdldCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkKFwiI2N1cnJlbmN5XCIpLmNoYW5nZShmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuYWRkQ3VycmVuY3lGcm9tU3RyaW5nKCQoXCIjY3VycmVuY3lcIikudmFsKCkpO1xuICAgICAgc2VsZi51cGRhdGVDdXJyZW5jeUxpc3QoKTtcbiAgICAgIHNlbGYuY29pbkxpc3Quc2hvd0xhc3Qoc2VsZi5ncmFwaCk7XG4gICAgICAkKFwiI2N1cnJlbmN5XCIpLnZhbChcIlwiKTtcbiAgICB9KTtcblxuICAgIC8qIGdlbmVyYXRlIHJhZGlvIGJ1dHRvbnMgKi9cbiAgICBmZXRjaChcIi4vLi4vc2V0dGluZ3MvYnV0dG9uTGlzdC5qc29uXCIpLnRoZW4oZnVuY3Rpb24ocmVzb2x2ZWQpIHtcbiAgICAgIHJldHVybiByZXNvbHZlZC5qc29uKCk7XG4gICAgfSkudGhlbihmdW5jdGlvbihidXR0b25zTGlzdCkge1xuICAgICAgY29uc29sZS5sb2coYnV0dG9uc0xpc3QpO1xuICAgICAgZm9yIChsZXQgaSBpbiBidXR0b25zTGlzdCkge1xuICAgICAgICAkKFwiI2NvbnRyb2xcIikuYXBwZW5kKGA8aW5wdXQgaWQ9XCIke2J1dHRvbnNMaXN0W2ldLmlkfVwiIHR5cGU9XCJyYWRpb1wiIG5hbWU9XCJpbnRlcnZhbFwiPjxsYWJlbCBmb3I9XCIke2J1dHRvbnNMaXN0W2ldLmlkfVwiIGNsYXNzPVwiaW50ZXJ2YWxMYWJlbFwiPiR7YnV0dG9uc0xpc3RbaV0uY2FwdGlvbn08L2xhYmVsPjxiciAvPmApO1xuICAgICAgICAoZnVuY3Rpb24oaSkge1xuICAgICAgICAgICQoXCIjXCIgKyBidXR0b25zTGlzdFtpXS5pZCkuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb2luTGlzdC5zaG93TGFzdChzZWxmLmdyYXBoLCBidXR0b25zTGlzdFtpXS50aW1lLCBidXR0b25zTGlzdFtpXS5jb3VudCk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInRpbWVJbnRlcnZhbFwiLCBidXR0b25zTGlzdFtpXS5pZCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pKGkpO1xuXG4gICAgICB9XG4gICAgICAkKFwiI2NvbnRyb2w+aW5wdXRcIikuY2hlY2tib3hyYWRpbyh7XG4gICAgICAgIGljb246IGZhbHNlLFxuICAgICAgICBjbGFzc2VzOiB7XG4gICAgICAgICAgXCJ1aS1jaGVja2JveHJhZGlvXCI6IFwiaGlnaGxpZ2h0XCJcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgICQoXCIjXCIgKyBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInRpbWVJbnRlcnZhbFwiKSkuY2xpY2soKTtcblxuICAgIH0pO1xuXG4gICAgJChcIiNjaG9vc2VDdXJyZW5jeVwiKS5jaGFuZ2UoZnVuY3Rpb24oKSB7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImV4Y2hhbmdlQ3VyclwiLCAkKFwiI2Nob29zZUN1cnJlbmN5XCIpLnZhbCgpKTtcbiAgICAgIGNvaW5MaXN0LmNvbnZlcnRUbyA9ICQoXCIjY2hvb3NlQ3VycmVuY3lcIikudmFsKCk7XG4gICAgICBjb2luTGlzdC5zaG93TGFzdChzZWxmLmdyYXBoKTtcbiAgICB9KTtcblxuICAgIGxldCBjdXJyZW5jeSA9ICQoXCIjY3VycmVuY3lXaW5kb3dcIikuZGlhbG9nKHtcbiAgICAgIGNsb3NlT25Fc2NhcGU6IGZhbHNlLFxuICAgICAgd2lkdGg6IDYwMCxcbiAgICAgIGhlaWdodDogMTQwLFxuICAgICAgbWluV2lkdGg6IDYwMCxcbiAgICAgIGRpYWxvZ0NsYXNzOiBcIm5vLWNsb3NlXCIsXG4gICAgICBwb3NpdGlvbjoge1xuICAgICAgICBteTogXCJsZWZ0IGJvdHRvbVwiLFxuICAgICAgICBhdDogXCJsZWZ0IHRvcFwiLFxuICAgICAgICBvZjogd2luZG93XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgd2luV2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAqIDAuOTtcbiAgICBsZXQgd2luSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICogMC43NztcbiAgICAkKFwiI3JlbmRlckNhbnZhc1wiKS5kaWFsb2coe1xuICAgICAgY2xvc2VPbkVzY2FwZTogZmFsc2UsXG4gICAgICB3aWR0aDogd2luV2lkdGgsXG4gICAgICBoZWlnaHQ6IHdpbkhlaWdodCxcbiAgICAgIGRpYWxvZ0NsYXNzOiBcIm5vLWNsb3NlXCIsXG4gICAgICBwb3NpdGlvbjoge1xuICAgICAgICBteTogXCJsZWZ0IHRvcFwiLFxuICAgICAgICBhdDogXCJsZWZ0IGJvdHRvbVwiLFxuICAgICAgICBvZjogY3VycmVuY3lcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBzdmcgPSBkMy5zZWxlY3QoXCIjcmVuZGVyQ2FudmFzXCIpLmFwcGVuZChcInN2ZzpzdmdcIikuYXR0cihcImlkXCIsIFwic3ZnXCIpO1xuICAgIGQzLnNlbGVjdChcInN2Z1wiKS5hdHRyKFwid2lkdGhcIiwgKHdpbldpZHRoIC0gMTUwKSkuYXR0cihcImhlaWdodFwiLCAod2luSGVpZ2h0IC0gNTApKTtcblxuICAgIHRoaXMuZ3JhcGggPSBuZXcgRHJhd0dyYXBoKHN2ZywgNTAsIDU1LCA1LCAxMDAsIDIwLCB3aW5XaWR0aCAtIDE1NSwgd2luSGVpZ2h0IC0gNTApO1xuXG4gICAgJChcIiNhZGRJbWdcIikuZGV0YWNoKCkuYXBwZW5kVG8oJChcIiNyZW5kZXJDYW52YXNcIikucGFyZW50KCkuZmluZChcIi51aS1kaWFsb2ctdGl0bGViYXI+LnVpLWRpYWxvZy10aXRsZVwiKSk7XG4gICAgJChcIiNhZGRJbWdcIikuYnV0dG9uKCk7XG5cbiAgICAkKFwiI2N1cnJlbmN5V2luZG93XCIpLmRpYWxvZygpO1xuICAgIC8vJChcIiNjb250cm9sXCIpLmRpYWxvZygpO1xuXG4gICAgJChcIiNhZGRJbWdcIikuY2xpY2soZnVuY3Rpb24oKSB7XG5cbiAgICAgIGxldCBzZXJpYWxpemVyID0gbmV3IFhNTFNlcmlhbGl6ZXIoKTtcblxuICAgICAgbGV0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICBhLmRvd25sb2FkID0gJ2NyeXB0b2NoYXJ0LnN2Zyc7XG4gICAgICBhLnR5cGUgPSAnaW1hZ2Uvc3ZnK3htbCc7XG4gICAgICB2YXIgYmxvYiA9IG5ldyBCbG9iKFsnPD94bWwgdmVyc2lvbj1cIjEuMFwiIHN0YW5kYWxvbmU9XCJub1wiPz5cXHJcXG4nICsgc2VyaWFsaXplci5zZXJpYWxpemVUb1N0cmluZygkKFwiI3N2Z1wiKVswXSldLCB7XCJ0eXBlXCI6IFwiaW1hZ2Uvc3ZnK3htbFwifSk7XG4gICAgICBhLmhyZWYgPSAod2luZG93LlVSTCB8fCB3ZWJraXRVUkwpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgIGEuY2xpY2soKTtcbiAgICAgICQoYSkuZGV0YWNoKCk7XG5cbiAgICB9KTtcbiAgfVxuXG4gIHJlc2l6ZVdpbmRvdyh0YXJnZXQpIHtcbiAgICBkMy5zZWxlY3QoXCJzdmdcIikuYXR0cihcIndpZHRoXCIsICgkKHRhcmdldCkud2lkdGgoKSAtIDExMCkpLmF0dHIoXCJoZWlnaHRcIiwgKCQodGFyZ2V0KS5oZWlnaHQoKSAtIDUwKSk7XG4gICAgdGhpcy5ncmFwaC5yZXNpemUoNTAsIDU1LCA1LCAxMDAsIDIwLCAkKHRhcmdldCkud2lkdGgoKSAtIDExMCwgJCh0YXJnZXQpLmhlaWdodCgpIC0gNTApO1xuXG4gIH1cbn1cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIHZhciBtYWluID0gbmV3IE1haW4oKTtcbiAgbWFpbi5pbml0KCk7XG59KTtcbiJdfQ==
