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
      //console.log(str)
      var self = this;
      this.myCurr = str.split(",");
      this.myCurr.map(function (val, index) {
        if (val === "") {
          self.myCurr.splice(index, 1);
        }
      });
    }
  }, {
    key: "addCurrency",
    value: function addCurrency(curr) {
      if (curr === "") {
        return;
      }
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

      //console.log(currencies, size);
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
      /*  console.log(str, "#" + (
          colors[0] + colors[1] + colors[2]));*/
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
      fetch("lib/settings/buttonList.json").then(function (resolved) {
        return resolved.json();
      }).then(function (buttonsList) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4xMC4yL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2FwaS5qcyIsInNyYy9jb2lubGlzdC5qcyIsInNyYy9jdXJyZW5jeS5qcyIsInNyYy9kcmF3R3JhcGguanMiLCJzcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUNBQTs7SUFFYSxXLFdBQUEsVztBQUNYLHlCQUFjO0FBQUE7QUFBRTs7OztrQ0FDRixjLEVBQWdCLEksRUFBTSxVLEVBQVksVyxFQUEwQjtBQUFBLFVBQWIsT0FBYSx1RUFBSCxDQUFHOztBQUN4RSxVQUFJLE9BQU8sSUFBWDtBQUNBLFVBQUksUUFBUSxVQUFaLEVBQXdCO0FBQ3RCLGVBQU8sUUFBUSxPQUFSLENBQWdCLEtBQUssT0FBTCxDQUFhLGNBQWIsRUFBNkIsV0FBN0IsQ0FBaEIsQ0FBUDtBQUNEO0FBQ0QsYUFBTyxNQUFNLGlEQUFpRCxjQUFqRCxHQUFrRSxRQUFsRSxHQUE2RSxJQUE3RSxHQUFvRixRQUFwRixHQUErRixVQUEvRixHQUE0RyxTQUE1RyxHQUF3SCxXQUE5SCxFQUEySSxJQUEzSSxDQUFnSixVQUFTLFFBQVQsRUFBbUI7QUFDeEssZUFBTyxTQUFTLElBQVQsRUFBUDtBQUNELE9BRk0sRUFFSixJQUZJLENBRUMsVUFBUyxJQUFULEVBQWU7QUFDckIsWUFBSSxLQUFLLFFBQUwsSUFBaUIsT0FBckIsRUFBOEI7QUFDNUIsY0FBSSxVQUFVLENBQWQsRUFBaUI7QUFDZixtQkFBTyxLQUFLLGFBQUwsQ0FBbUIsY0FBbkIsRUFBbUMsSUFBbkMsRUFBeUMsVUFBekMsRUFBcUQsV0FBckQsRUFBa0UsVUFBVSxDQUE1RSxDQUFQO0FBQ0Q7QUFDRixTQUpELE1BSU87QUFDTCxpQkFBUSxJQUFSO0FBQ0Q7QUFDRixPQVZNLENBQVA7QUFXRDs7O2lDQUVZ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RVksTSxFQUFRO0FBQ25CLFNBQUcsTUFBSCxDQUFVLEtBQVYsRUFBaUIsSUFBakIsQ0FBc0IsT0FBdEIsRUFBZ0MsRUFBRSxNQUFGLEVBQVUsS0FBVixLQUFvQixHQUFwRCxFQUEwRCxJQUExRCxDQUErRCxRQUEvRCxFQUEwRSxFQUFFLE1BQUYsRUFBVSxNQUFWLEtBQXFCLEVBQS9GO0FBQ0EsV0FBSyxLQUFMLENBQVcsTUFBWCxDQUFrQixFQUFsQixFQUFzQixFQUF0QixFQUEwQixDQUExQixFQUE2QixHQUE3QixFQUFrQyxFQUFsQyxFQUFzQyxFQUFFLE1BQUYsRUFBVSxLQUFWLEtBQW9CLEdBQTFELEVBQStELEVBQUUsTUFBRixFQUFVLE1BQVYsS0FBcUIsRUFBcEY7QUFFRDs7Ozs7O0FBR0gsRUFBRSxRQUFGLEVBQVksS0FBWixDQUFrQixZQUFXO0FBQzNCLE1BQUksT0FBTyxJQUFJLElBQUosRUFBWDtBQUNBLE9BQUssSUFBTDtBQUNELENBSEQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuZXhwb3J0IGNsYXNzIEN1cnJlbmN5QVBJIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuICBnZXRIaXN0b3JpY2FsKGhvdXJzT3JNaW51dGVzLCBuYW1lLCBjb252ZXJzaW9uLCB2YWx1ZXNDb3VudCwgY291bnRlciA9IDApIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKG5hbWUgPT0gY29udmVyc2lvbikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShzZWxmLmFsd2F5czEoaG91cnNPck1pbnV0ZXMsIHZhbHVlc0NvdW50KSk7XG4gICAgfVxuICAgIHJldHVybiBmZXRjaChcImh0dHBzOi8vbWluLWFwaS5jcnlwdG9jb21wYXJlLmNvbS9kYXRhL2hpc3RvXCIgKyBob3Vyc09yTWludXRlcyArIFwiP2ZzeW09XCIgKyBuYW1lICsgXCImdHN5bT1cIiArIGNvbnZlcnNpb24gKyBcIiZsaW1pdD1cIiArIHZhbHVlc0NvdW50KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgaWYgKGRhdGEuUmVzcG9uc2UgPT0gXCJFcnJvclwiKSB7XG4gICAgICAgIGlmIChjb3VudGVyIDwgNSkge1xuICAgICAgICAgIHJldHVybiBzZWxmLmdldEhpc3RvcmljYWwoaG91cnNPck1pbnV0ZXMsIG5hbWUsIGNvbnZlcnNpb24sIHZhbHVlc0NvdW50LCBjb3VudGVyICsgMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAoZGF0YSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXRDdXJyZW50KCkge31cblxuICBnZXRDb2lucygpIHtcbiAgICByZXR1cm4gZmV0Y2goXCJodHRwczovL21pbi1hcGkuY3J5cHRvY29tcGFyZS5jb20vZGF0YS9hbGwvY29pbmxpc3RcIikudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFsd2F5czEoaG91cnNPck1pbnV0ZXMsIHZhbHVlc0NvdW50KSB7XG4gICAgbGV0IGludGVydmFsID0gNjA7XG4gICAgaWYgKGhvdXJzT3JNaW51dGVzID09IFwiaG91clwiKSB7XG4gICAgICBpbnRlcnZhbCA9IDM2MDA7XG4gICAgfVxuICAgIGlmIChob3Vyc09yTWludXRlcyA9PSBcImRheVwiKSB7XG4gICAgICBpbnRlcnZhbCA9IDM2MDAgKiAyNDtcbiAgICB9XG4gICAgbGV0IGN1cnJlbnRUaW1lID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgY3VycmVudFRpbWUgLT0gY3VycmVudFRpbWUgJSBpbnRlcnZhbDtcbiAgICBsZXQgdGltZUZyb20gPSBjdXJyZW50VGltZSAtIGludGVydmFsICogdmFsdWVzQ291bnQ7XG5cbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIFRpbWVUbzogY3VycmVudFRpbWUsXG4gICAgICBUaW1lRnJvbTogdGltZUZyb20sXG4gICAgICBEYXRhOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBjbG9zZTogMSxcbiAgICAgICAgICB0aW1lOiB0aW1lRnJvbVxuICAgICAgICB9LCB7XG4gICAgICAgICAgY2xvc2U6IDEsXG4gICAgICAgICAgdGltZTogY3VycmVudFRpbWVcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH07XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge0N1cnJlbmN5QVBJfTtcbiIsIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cbmltcG9ydCB7Q3VycmVuY3l9IGZyb20gJy4vY3VycmVuY3kuanMnO1xuXG5leHBvcnQgY2xhc3MgQ29pbmxpc3Qge1xuICBjb25zdHJ1Y3RvcihhcGkpIHtcbiAgICB0aGlzLm15Q3VyciA9IFtdO1xuICAgIHRoaXMuZ3JhcGggPSBudWxsO1xuICAgIHRoaXMuY3VycmVuY2llcyA9IFtdO1xuICAgIHRoaXMuaG91ck9yTWluID0gXCJtaW51dGVcIjtcbiAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICAgIHRoaXMuY29udmVydFRvID0gXCJVU0RcIjtcbiAgICB0aGlzLnZhbHVlc0NvdW50ID0gNzIwO1xuICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5hcGkgPSBhcGk7XG4gIH1cblxuICB1cGdyYWRlQ3Vyckxpc3Qoc3RyKSB7XG4gICAgLy9jb25zb2xlLmxvZyhzdHIpXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMubXlDdXJyID0gc3RyLnNwbGl0KFwiLFwiKTtcbiAgICB0aGlzLm15Q3Vyci5tYXAoZnVuY3Rpb24odmFsLCBpbmRleCkge1xuICAgICAgaWYgKHZhbCA9PT0gXCJcIikge1xuICAgICAgICBzZWxmLm15Q3Vyci5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgYWRkQ3VycmVuY3koY3Vycikge1xuICAgIGlmIChjdXJyID09PSBcIlwiKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gIH1cblxuICBzaG93TGFzdChncmFwaCwgaG91ck9yTWluID0gbnVsbCwgdmFsdWVzQ291bnQgPSBudWxsKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCF0aGlzLmlzTG9hZGluZykge1xuICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZ3JhcGggPSBncmFwaCB8fCB0aGlzLmdyYXBoO1xuXG4gICAgaWYgKHRoaXMuaW50ZXJ2YWwpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XG4gICAgICB0aGlzLmludGVydmFsID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoaG91ck9yTWluICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmhvdXJPck1pbiA9IGhvdXJPck1pbjtcbiAgICB9XG4gICAgaWYgKHZhbHVlc0NvdW50ICE9PSBudWxsKSB7XG4gICAgICB0aGlzLnZhbHVlc0NvdW50ID0gdmFsdWVzQ291bnQ7XG4gICAgfVxuXG4gICAgdGhpcy5jb3VudGVyID0gMDtcblxuICAgIHRoaXMuY3VycmVuY2llcyA9IFtdO1xuICAgIGZvciAodmFyIGkgaW4gdGhpcy5teUN1cnIpIHtcbiAgICAgIHZhciBjdXJyID0gbmV3IEN1cnJlbmN5KHRoaXMubXlDdXJyW2ldLCB0aGlzLmNvbnZlcnRUbyk7XG4gICAgICBjdXJyLmdldEhpc3RvcmljTGFzdCh0aGlzLCBpKTtcbiAgICAgIHRoaXMuY3VycmVuY2llcy5wdXNoKGN1cnIpO1xuICAgIH1cblxuICAgIHZhciB0aW1lb3V0ID0gMDtcbiAgICBpZiAodGhpcy5ob3VyT3JNaW4gPT0gXCJtaW51dGVcIikge1xuICAgICAgdGltZW91dCA9IDYwMDAwIC0gRGF0ZS5ub3coKSAlIDYwMDAwO1xuICAgICAgaWYgKHRpbWVvdXQgPT0gMClcbiAgICAgICAgdGltZW91dCArPSA2MDAwMDtcbiAgICAgIH1cbiAgICBpZiAodGhpcy5ob3VyT3JNaW4gPT0gXCJob3VyXCIpIHtcbiAgICAgIHRpbWVvdXQgPSAzNjAwMDAwIC0gRGF0ZS5ub3coKSAlIDM2MDAwMDA7XG4gICAgICBpZiAodGltZW91dCA9PSAwKVxuICAgICAgICB0aW1lb3V0ICs9IDM2MDAwMDA7XG4gICAgICB9XG4gICAgaWYgKHRoaXMuaG91ck9yTWluICE9IFwiZGF5XCIpIHtcbiAgICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5zaG93TGFzdChncmFwaCk7XG4gICAgICB9LCB0aW1lb3V0KTtcbiAgICB9XG4gIH1cblxuICBpbmNyZWFzZUNvdW50ZXIoKSB7XG4gICAgdGhpcy5jb3VudGVyKys7XG4gICAgaWYgKHRoaXMuY291bnRlciA+PSB0aGlzLm15Q3Vyci5sZW5ndGgpIHtcbiAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmdyYXBoLmRyYXdHcmFwaCh0aGlzLCB0aGlzLmhvdXJPck1pbiwgdGhpcy52YWx1ZXNDb3VudCk7XG4gICAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICAgIH1cbiAgfVxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuZXhwb3J0IGNsYXNzIEN1cnJlbmN5IHtcbiAgY29uc3RydWN0b3IobmFtZSwgY29udiwgbG9uZyA9IG51bGwpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMubG9uZ25hbWUgPSBsb25nIHx8IG5hbWU7XG4gICAgdGhpcy5jb252ZXJzaW9uID0gY29udjtcbiAgICAvLyAgICB0aGlzLmluZGV4ID0gMDtcbiAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICAgIHNlbGYudmFsdWVzID0gW107XG4gIH1cblxuICBnZXRIaXN0b3JpY0xhc3QoY29pbmxpc3QsIGluZCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAvL3RoaXMuaW5kZXggPSBpbmQ7XG5cbiAgICB2YXIgaG91cnNPck1pbnV0ZXMgPSBjb2lubGlzdC5ob3VyT3JNaW47XG5cbiAgICBjb2lubGlzdC5hcGkuZ2V0SGlzdG9yaWNhbChob3Vyc09yTWludXRlcywgdGhpcy5uYW1lLCB0aGlzLmNvbnZlcnNpb24sIGNvaW5saXN0LnZhbHVlc0NvdW50KS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHNlbGYuc2F2ZUdyYXBoKGRhdGEpO1xuICAgICAgY29pbmxpc3QuaW5jcmVhc2VDb3VudGVyKCk7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICBjb2lubGlzdC5pbmNyZWFzZUNvdW50ZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHNhdmVHcmFwaChkYXRhKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYudmFsdWVzID0gW107XG4gICAgaWYgKGRhdGEuUmVzcG9uc2UgPT0gXCJFcnJvclwiKSB7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIiBFcnJvclwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZWxmLnZhbHVlcy5tYXggPSBkYXRhLkRhdGEucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBNYXRoLm1heChhLCBiLmNsb3NlKTtcbiAgICB9LCAwKTtcblxuICAgIHNlbGYudmFsdWVzLm1pbiA9IGRhdGEuRGF0YS5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIE1hdGgubWluKGEsIGIuY2xvc2UpO1xuICAgIH0sIHNlbGYudmFsdWVzLm1heCk7XG5cbiAgICBzZWxmLnZhbHVlcy5taWQgPSAoc2VsZi52YWx1ZXMubWF4ICsgc2VsZi52YWx1ZXMubWluKSAvIDI7XG5cbiAgICBzZWxmLnZhbHVlcy5tYXhSZWxhdGl2ZSA9IHNlbGYudmFsdWVzLm1heCAvIHNlbGYudmFsdWVzLm1pZCAqIDEwMCAtIDEwMDtcbiAgICBzZWxmLnZhbHVlcy5kYXRhID0gW107XG4gICAgc2VsZi52YWx1ZXMudGltZVRvID0gZGF0YS5UaW1lVG87XG4gICAgc2VsZi52YWx1ZXMudGltZUZyb20gPSBkYXRhLlRpbWVGcm9tO1xuXG4gICAgZm9yIChsZXQgaSBpbiBkYXRhLkRhdGEpIHtcbiAgICAgIHNlbGYudmFsdWVzLmRhdGEucHVzaCh7XG4gICAgICAgIGNsb3NlOiBkYXRhLkRhdGFbaV0uY2xvc2UsXG4gICAgICAgIHJlbGF0aXZlOiAoZGF0YS5EYXRhW2ldLmNsb3NlIC0gc2VsZi52YWx1ZXMubWlkKSAvIHNlbGYudmFsdWVzLm1pZCAqIDEwMCxcbiAgICAgICAgdGltZTogZGF0YS5EYXRhW2ldLnRpbWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vd2JrZC9kMy1leHRlbmRlZFxuZDMuc2VsZWN0aW9uLnByb3RvdHlwZS5tb3ZlVG9Gcm9udCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzKTtcbiAgfSk7XG59O1xuZDMuc2VsZWN0aW9uLnByb3RvdHlwZS5tb3ZlVG9CYWNrID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZpcnN0Q2hpbGQgPSB0aGlzLnBhcmVudE5vZGUuZmlyc3RDaGlsZDtcbiAgICBpZiAoZmlyc3RDaGlsZCkge1xuICAgICAgdGhpcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLCBmaXJzdENoaWxkKTtcbiAgICB9XG4gIH0pO1xufTtcblxuZXhwb3J0IGNsYXNzIERyYXdHcmFwaCB7XG4gIGNvbnN0cnVjdG9yKHN2Zywgc3RhcnRYLCBzdGFydFksIGJ1dHRvblksIGJ1dHRXaWR0aCwgYnV0dEhlaWdodCwgd2lkdGgsIGhlaWdodCkge1xuICAgIHRoaXMuc3ZnID0gc3ZnO1xuICAgIHRoaXMuc3RhcnRYID0gc3RhcnRYO1xuICAgIHRoaXMuc3RhcnRZID0gc3RhcnRZO1xuICAgIHRoaXMuYnV0dG9uWSA9IGJ1dHRvblk7XG4gICAgdGhpcy5idXR0b25XaWR0aCA9IGJ1dHRXaWR0aDtcbiAgICB0aGlzLmJ1dHRvbkhlaWdodCA9IGJ1dHRIZWlnaHQ7XG5cbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodCAtIHN0YXJ0WSAqIDIgLSAxMDtcbiAgICB0aGlzLndpZHRoID0gd2lkdGggLSBzdGFydFggLSAxMDtcblxuICAgIHRoaXMuZGl2ID0gZDMuc2VsZWN0KFwiYm9keVwiKS5hcHBlbmQoXCJkaXZcIikuYXR0cihcImNsYXNzXCIsIFwidG9vbHRpcFwiKS5zdHlsZShcIm9wYWNpdHlcIiwgMCk7XG4gICAgdGhpcy5yZXNldFBhcGVyKCk7XG4gIH1cblxuICByZXNpemUoc3RhcnRYLCBzdGFydFksIGJ1dHRvblksIGJ1dHRXaWR0aCwgYnV0dEhlaWdodCwgd2lkdGgsIGhlaWdodCkge1xuICAgIHRoaXMuc3RhcnRYID0gc3RhcnRYO1xuICAgIHRoaXMuc3RhcnRZID0gc3RhcnRZO1xuICAgIHRoaXMuYnV0dG9uWSA9IGJ1dHRvblk7XG4gICAgdGhpcy5idXR0b25XaWR0aCA9IGJ1dHRXaWR0aDtcbiAgICB0aGlzLmJ1dHRvbkhlaWdodCA9IGJ1dHRIZWlnaHQ7XG5cbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodCAtIHN0YXJ0WSAqIDIgLSAxMDtcbiAgICB0aGlzLndpZHRoID0gd2lkdGggLSBzdGFydFggLSAxMDtcblxuICAgIHRoaXMuZHJhd0dyYXBoKCk7XG4gIH1cblxuICByZXNldFBhcGVyKCkge1xuICAgIHRoaXMucmVzZXRHcmFwaCgpO1xuICAgIHRoaXMuY29sb3JzID0gW107XG4gIH1cblxuICByZXNldEdyYXBoKCkge1xuICAgIHRoaXMuc3ZnLnNlbGVjdEFsbChcIipcIikucmVtb3ZlKCk7XG4gIH1cblxuICBpbml0Q29sb3JzKGN1cnJlbmNpZXMsIHNpemUpIHtcblxuICAgIC8vY29uc29sZS5sb2coY3VycmVuY2llcywgc2l6ZSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcblxuICAgICAgdGhpcy5jb2xvcnNbaV0gPSBEcmF3R3JhcGguZ2VuZXJhdGVDb2xvcihjdXJyZW5jaWVzW2ldLm5hbWUgKyBcIi9cIiArIGN1cnJlbmNpZXNbaV0ubmFtZSk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGdlbmVyYXRlQ29sb3Ioc3RyKSB7XG4gICAgbGV0IGhhc2ggPSAwO1xuICAgIGlmIChzdHIubGVuZ3RoID09IDApXG4gICAgICByZXR1cm4gaGFzaDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGNoYXIgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgIGhhc2ggPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSArIGNoYXI7XG4gICAgICBoYXNoID0gaGFzaCAmIGhhc2g7IC8vIENvbnZlcnQgdG8gMzJiaXQgaW50ZWdlclxuICAgIH1cblxuICAgIHZhciBjb2xvcnMgPSBbMHg5OTAwMDAsIDB4MDA5OTAwLCAweDAwMDA5OV07XG5cbiAgICBoYXNoID0gKGhhc2gpICUgKDE2Nzc3MjE2IC8qIDIwOTcxNTIgMTY3NzcyMTYgKi8gKTsgLy9cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IDM7IGorKykge1xuICAgICAgY29sb3JzW2pdID0gKCgoaGFzaCAmIGNvbG9yc1tqXSkgPj4gKDE2IC0gaiAqIDgpKSArIDB4MjIpLnRvU3RyaW5nKDE2KTtcbiAgICAgIGNvbG9yc1tqXSA9IChcbiAgICAgICAgY29sb3JzW2pdLmxlbmd0aCA9PSAxID9cbiAgICAgICAgXCIwXCIgKyBjb2xvcnNbal0gOlxuICAgICAgICBjb2xvcnNbal0pO1xuICAgIH1cbiAgICAvKiAgY29uc29sZS5sb2coc3RyLCBcIiNcIiArIChcbiAgICAgICAgY29sb3JzWzBdICsgY29sb3JzWzFdICsgY29sb3JzWzJdKSk7Ki9cbiAgICByZXR1cm4gKFwiI1wiICsgKFxuICAgICAgY29sb3JzWzBdICsgY29sb3JzWzFdICsgY29sb3JzWzJdKSk7XG4gIH1cblxuICBkcmF3R3JhcGgoY29pbmxpc3QpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKGNvaW5saXN0KSB7XG4gICAgICB0aGlzLmNvaW5saXN0ID0gY29pbmxpc3Q7XG4gICAgfVxuICAgIGlmICghY29pbmxpc3QpIHtcbiAgICAgIGNvaW5saXN0ID0gdGhpcy5jb2lubGlzdDtcbiAgICB9XG4gICAgaWYgKCFjb2lubGlzdCB8fCBjb2lubGlzdC5pc0xvYWRpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnJlc2V0UGFwZXIoKTtcblxuICAgIHRoaXMuaW5pdENvbG9ycyhjb2lubGlzdC5jdXJyZW5jaWVzLCBjb2lubGlzdC5jdXJyZW5jaWVzLmxlbmd0aCk7XG5cbiAgICB2YXIgbWF4VmFsID0gY29pbmxpc3QuY3VycmVuY2llcy5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KGEsIGIudmFsdWVzLm1heFJlbGF0aXZlKTtcbiAgICB9LCAwKTtcblxuICAgIHZhciB0aW1lRnJvbSA9IGNvaW5saXN0LmN1cnJlbmNpZXMucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBNYXRoLm1pbihhLCBiLnZhbHVlcy50aW1lRnJvbSk7XG4gICAgfSwgTnVtYmVyLk1BWF9WQUxVRSk7XG5cbiAgICB2YXIgdGltZVRvID0gY29pbmxpc3QuY3VycmVuY2llcy5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KGEsIGIudmFsdWVzLnRpbWVUbyk7XG4gICAgfSwgMCk7XG5cbiAgICB2YXIgc2NhbGVZID0gZDMuc2NhbGVMaW5lYXIoKS5kb21haW4oW1xuICAgICAgMTAwICsgbWF4VmFsLFxuICAgICAgMTAwIC0gbWF4VmFsXG4gICAgXSkucmFuZ2UoWzAsIHRoaXMuaGVpZ2h0XSk7XG5cbiAgICB2YXIgc2NhbGVYID0gZDMuc2NhbGVUaW1lKCkuZG9tYWluKFtcbiAgICAgIG5ldyBEYXRlKHRpbWVGcm9tICogMTAwMCAtIDEpLFxuICAgICAgbmV3IERhdGUodGltZVRvICogMTAwMCArIDEpXG4gICAgXSkucmFuZ2UoWzAsIHRoaXMud2lkdGhdKTtcblxuICAgIHZhciB0aW1lRm9ybWF0ID0gZDMudGltZUZvcm1hdChcIiVIOiVNICVkLSVtLSVZXCIpO1xuXG4gICAgdmFyIHlfYXhpcyA9IGQzLmF4aXNMZWZ0KCkudGlja3MoMjApLnNjYWxlKHNjYWxlWSk7XG4gICAgdmFyIHhfYXhpcyA9IGQzLmF4aXNCb3R0b20oKS50aWNrcygyMCkudGlja0Zvcm1hdCh0aW1lRm9ybWF0KS5zY2FsZShzY2FsZVgpO1xuXG4gICAgdGhpcy5zdmcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHt0aGlzLnN0YXJ0WH0sJHt0aGlzLnN0YXJ0WX0pYCkuY2FsbCh5X2F4aXMpO1xuICAgIHRoaXMuc3ZnLmFwcGVuZChcImdcIikuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7dGhpcy5zdGFydFh9LCAke3RoaXMuaGVpZ2h0ICsgdGhpcy5zdGFydFl9KWApLmNhbGwoeF9heGlzKS5zZWxlY3RBbGwoXCJ0ZXh0XCIpLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgXCJlbmRcIikudGV4dChmdW5jdGlvbihkKSB7XG4gICAgICB2YXIgdCA9IGQzLnNlbGVjdCh0aGlzLnBhcmVudE5vZGUpLmFwcGVuZChcInRleHRcIikuc3R5bGUoXCJ0ZXh0LWFuY2hvclwiLCBcImVuZFwiKS5hdHRyKFwiZmlsbFwiLCBcImJsYWNrXCIpLnRleHQodGltZUZvcm1hdChkKS50b1N0cmluZygpLnNwbGl0KFwiIFwiKVswXSkuYXR0cihcImR4XCIsIFwiLTEuOGVtXCIpLmF0dHIoXCJkeVwiLCBcIi4xNWVtXCIpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJyb3RhdGUoLTY1KVwiKTtcbiAgICAgIHJldHVybiB0aW1lRm9ybWF0KGQpLnRvU3RyaW5nKCkuc3BsaXQoXCIgXCIpWzFdO1xuICAgIH0pLmF0dHIoXCJkeFwiLCBcIi0uOGVtXCIpLmF0dHIoXCJkeVwiLCBcIi4xNWVtXCIpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJyb3RhdGUoLTY1KVwiKTtcblxuICAgIC8vIGFkZCB0aGUgWCBncmlkbGluZXNcbiAgICB0aGlzLnN2Zy5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImdyaWRcIikuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7c2VsZi5zdGFydFh9LCAke3NlbGYuaGVpZ2h0ICsgc2VsZi5zdGFydFl9KWApLmNhbGwoZDMuYXhpc0JvdHRvbShzY2FsZVgpLnRpY2tzKDEwKS50aWNrU2l6ZSgtc2VsZi5oZWlnaHQpLnRpY2tGb3JtYXQoXCJcIikpO1xuXG4gICAgLy8gYWRkIHRoZSBZIGdyaWRsaW5lc1xuICAgIHRoaXMuc3ZnLmFwcGVuZChcImdcIikuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7c2VsZi5zdGFydFh9LCAke3NlbGYuc3RhcnRZfSlgKS5hdHRyKFwiY2xhc3NcIiwgXCJncmlkXCIpLmNhbGwoZDMuYXhpc0xlZnQoc2NhbGVZKS50aWNrcyg1KS50aWNrU2l6ZSgtc2VsZi53aWR0aCAtIHNlbGYuc3RhcnRYKS50aWNrRm9ybWF0KFwiXCIpKTtcblxuICAgIHZhciBzZWxlY3RDbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGQzLnNlbGVjdCh0aGlzLnBhcmVudE5vZGUpLnN0eWxlKFwib3BhY2l0eVwiKSA9PSAxKSB7XG4gICAgICAgIGQzLnNlbGVjdEFsbChcIi5ncmFwaFwiKS5zdHlsZShcIm9wYWNpdHlcIiwgMC45OSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkMy5zZWxlY3RBbGwoXCIuZ3JhcGhcIikuc3R5bGUoXCJvcGFjaXR5XCIsIDAuMSk7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzLnBhcmVudE5vZGUpLnN0eWxlKFwib3BhY2l0eVwiLCAxKS5tb3ZlVG9Gcm9udCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvL2FkZCB0ZXh0IGJ1dHRvbnNcbiAgICB0aGlzLnN2Zy5zZWxlY3RBbGwoXCJyZWN0XCIpLmRhdGEoY29pbmxpc3QuY3VycmVuY2llcykuZW50ZXIoKS5hcHBlbmQoXCJyZWN0XCIpLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uKGQsIGluZCkge1xuICAgICAgcmV0dXJuIHNlbGYuc3RhcnRYICsgaW5kICogc2VsZi5idXR0b25XaWR0aDtcbiAgICB9KS5hdHRyKFwid2lkdGhcIiwgc2VsZi5idXR0b25XaWR0aCkuYXR0cihcImhlaWdodFwiLCBzZWxmLmJ1dHRvbkhlaWdodCAqIDEuOCkuYXR0cihcInlcIiwgc2VsZi5idXR0b25ZKS5hdHRyKFwiZmlsbFwiLCBmdW5jdGlvbihkLCBpbmQpIHtcbiAgICAgIHJldHVybiBzZWxmLmNvbG9yc1tpbmRdO1xuICAgIH0pLmF0dHIoXCJjbGFzc1wiLCBcImJ1dHRvblwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgIHNlbGYuc3ZnLnNlbGVjdChcIi5ncmFwaC5jX1wiICsgZC5uYW1lICsgXCIgPiBwYXRoXCIpLm5vZGUoKS5kaXNwYXRjaEV2ZW50KG5ldyBNb3VzZUV2ZW50KFwiY2xpY2tcIikpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zdmcuc2VsZWN0QWxsKFwidGV4dC5idXR0b25MYWJlbFwiKS5kYXRhKGNvaW5saXN0LmN1cnJlbmNpZXMpLmVudGVyKCkuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwieFwiLCBmdW5jdGlvbihkLCBpbmQpIHtcbiAgICAgIHJldHVybiBzZWxmLnN0YXJ0WCArIGluZCAqIHNlbGYuYnV0dG9uV2lkdGggKyBzZWxmLmJ1dHRvbldpZHRoICogMC41O1xuICAgIH0pLmF0dHIoXCJmaWxsXCIsIGZ1bmN0aW9uKGQsIGluZCkge1xuICAgICAgcmV0dXJuIHNlbGYuY29sb3JzW2luZF07XG4gICAgfSkuYXR0cihcInlcIiwgc2VsZi5idXR0b25ZICsgc2VsZi5idXR0b25IZWlnaHQgKiAwLjYpLnRleHQoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGQubmFtZTtcbiAgICB9KS5hdHRyKFwiY2xhc3NcIiwgXCJidXR0b25MYWJlbFwiKS5hdHRyKFwiZm9udC1zaXplXCIsIHNlbGYuYnV0dG9uSGVpZ2h0ICogMC42KS5hdHRyKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIik7XG5cbiAgICB0aGlzLnN2Zy5zZWxlY3RBbGwoXCJ0ZXh0LmNhcHRpb25cIikuZGF0YShjb2lubGlzdC5jdXJyZW5jaWVzKS5lbnRlcigpLmFwcGVuZChcInRleHRcIikuYXR0cihcInhcIiwgZnVuY3Rpb24oZCwgaW5kKSB7XG4gICAgICByZXR1cm4gc2VsZi5zdGFydFggKyBpbmQgKiBzZWxmLmJ1dHRvbldpZHRoICsgc2VsZi5idXR0b25XaWR0aCAqIDAuNTtcbiAgICB9KS5hdHRyKFwieVwiLCBzZWxmLmJ1dHRvblkgKyBzZWxmLmJ1dHRvbkhlaWdodCAqIDAuNiAqIDIpLnRleHQoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGQudmFsdWVzLmRhdGFbZC52YWx1ZXMuZGF0YS5sZW5ndGggLSAxXS5jbG9zZTtcbiAgICB9KS5hdHRyKFwiY2xhc3NcIiwgXCJidXR0b25MYWJlbCBjYXB0aW9uXCIpLmF0dHIoXCJmaWxsXCIsIGZ1bmN0aW9uKGQsIGluZCkge1xuICAgICAgcmV0dXJuIHNlbGYuY29sb3JzW2luZF07XG4gICAgfSkuYXR0cihcImZvbnQtc2l6ZVwiLCBzZWxmLmJ1dHRvbkhlaWdodCAqIDAuNikuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpO1xuXG4gICAgLy9kcmF3Z3JhcGhcbiAgICB2YXIgdmFsdWVsaW5lID0gZDMubGluZSgpLngoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIHNjYWxlWChkLnRpbWUgKiAxMDAwKTtcbiAgICB9KS55KGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBzY2FsZVkoZC5yZWxhdGl2ZSArIDEwMCk7XG4gICAgfSk7XG5cbiAgICBjb2lubGlzdC5jdXJyZW5jaWVzLmZvckVhY2goZnVuY3Rpb24oY3VyciwgaW5kZXgpIHtcbiAgICAgIGxldCBnID0gc2VsZi5zdmcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJncmFwaCBjX1wiICsgY3Vyci5uYW1lKTtcbiAgICAgIGcuYXBwZW5kKFwicGF0aFwiKS5kYXRhKFtjdXJyLnZhbHVlcy5kYXRhXSkuYXR0cihcImNsYXNzXCIsIFwicGF0aCBjX1wiICsgY3Vyci5uYW1lKS5hdHRyKFwiZFwiLCB2YWx1ZWxpbmUpLmF0dHIoXCJmaWxsXCIsIFwidHJhbnNwYXJlbnRcIikuYXR0cihcInN0cm9rZVwiLCBzZWxmLmNvbG9yc1tpbmRleF0pLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgke3NlbGYuc3RhcnRYfSwke3NlbGYuc3RhcnRZfSlgKS5vbihcImNsaWNrXCIsIHNlbGVjdENsaWNrKS5tb3ZlVG9CYWNrKCk7XG5cbiAgICAgIGcuc2VsZWN0QWxsKFwiY2lyY2xlIC5jX1wiICsgY3Vyci5uYW1lKS5kYXRhKGN1cnIudmFsdWVzLmRhdGEpLmVudGVyKCkuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJjbGFzc1wiLCBcImNfXCIgKyBjdXJyLm5hbWUpLmF0dHIoXCJjeFwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBzY2FsZVgoZC50aW1lICogMTAwMCk7XG4gICAgICB9KS5hdHRyKFwiY3lcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gc2NhbGVZKGQucmVsYXRpdmUgKyAxMDApO1xuICAgICAgfSkuYXR0cihcInJcIiwgMSkuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7c2VsZi5zdGFydFh9LCR7c2VsZi5zdGFydFl9KWApLmF0dHIoXCJmaWxsXCIsIHNlbGYuY29sb3JzW2luZGV4XSkuYXR0cihcInN0cm9rZVwiLCBzZWxmLmNvbG9yc1tpbmRleF0pLm1vdmVUb0Zyb250KCkub24oXCJjbGlja1wiLCBzZWxlY3RDbGljaykub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICBkMy5zZWxlY3QodGhpcykuYXR0cihcInJcIiwgNCk7XG4gICAgICAgIHNlbGYuZGl2LnRyYW5zaXRpb24oKS5kdXJhdGlvbigyMDApLnN0eWxlKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpLnN0eWxlKFwib3BhY2l0eVwiLCAwLjkpO1xuXG4gICAgICAgIHNlbGYuZGl2Lmh0bWwoY29pbmxpc3QuY3VycmVuY2llc1tpbmRleF0ubmFtZSArIFwiPGJyIFxcPlwiICsgZC5jbG9zZSArIFwiIFwiICsgY29pbmxpc3QuY29udmVydFRvICsgXCI8YnIgXFw+XCIgKyB0aW1lRm9ybWF0KG5ldyBEYXRlKGQudGltZSAqIDEwMDApKSkuc3R5bGUoXCJwb3NpdGlvblwiLCBcImFic29sdXRlXCIpLnN0eWxlKFwibGVmdFwiLCAoZDMuZXZlbnQucGFnZVgpICsgXCJweFwiKS5zdHlsZShcInRvcFwiLCAoZDMuZXZlbnQucGFnZVkgLSA2NSkgKyBcInB4XCIpO1xuICAgICAgfSkub24oXCJtb3VzZW91dFwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiclwiLCAxKTtcbiAgICAgICAgc2VsZi5kaXYudHJhbnNpdGlvbigpLmR1cmF0aW9uKDUwMCkuc3R5bGUoXCJvcGFjaXR5XCIsIDApLnN0eWxlKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG59IiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG4vLyBUT0RPOiBBZGQgcHJvbWlzZXMgZXZlcnl3aGVyZVxuLy8gVE9ETzogQ2xlYW4gdW5uZWNlc3NhcnkgalF1ZXJ5XG4vLyBUT0RPOiBNdWx0aXBsZSB3aW5kb3dzIGltcG9ydCB7Q3VycmVuY3lBUEl9IGZyb20gJy4vYXBpLmpzJztcbmltcG9ydCB7Q3VycmVuY3lBUEl9IGZyb20gJy4vYXBpLmpzJztcbmltcG9ydCB7Q29pbmxpc3R9IGZyb20gJy4vY29pbmxpc3QuanMnO1xuaW1wb3J0IHtDdXJyZW5jeX0gZnJvbSAnLi9jdXJyZW5jeS5qcyc7XG5pbXBvcnQge0RyYXdHcmFwaH0gZnJvbSAnLi9kcmF3R3JhcGguanMnO1xuXG5jbGFzcyBNYWluIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIGluaXQoKSB7XG4gICAgdGhpcy5hcGkgPSBuZXcgQ3VycmVuY3lBUEkoKTtcblxuICAgIHRoaXMuY29pbkxpc3QgPSBuZXcgQ29pbmxpc3QodGhpcy5hcGkpO1xuXG4gICAgdGhpcy5hcGkuZ2V0Q29pbnMoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZGF0YS5EYXRhKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAkKFwiI2N1cnJlbmNpZXNcIikuYXBwZW5kKGA8b3B0aW9uIHZhbHVlPScke2RhdGEuRGF0YVtrZXlzW2ldXS5GdWxsTmFtZX0nPjwvb3B0aW9uPmApO1xuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLmFkZEN1cnJlbmNpZXModGhpcy5sb2FkU3RvcmFnZSgpKTtcbiAgICB0aGlzLmV4Y2hhbmdlQ3VycmVuY3koKTtcbiAgICB0aGlzLnVwZGF0ZUN1cnJlbmN5TGlzdCgpO1xuICAgIHRoaXMuc2VsZWN0ZWRUaW1lKCk7XG5cbiAgICB0aGlzLmluaXRJbnRlcmZhY2UodGhpcy5ncmFwaCwgdGhpcy5jb2luTGlzdCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG5cbiAgfVxuXG4gIGFkZEN1cnJlbmNpZXMoY3VyckFycmF5KSB7XG4gICAgJChcIiNjdXJybGlzdFwiKS5lbXB0eSgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY3VyckFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLmFkZEN1cnJlbmN5RnJvbVN0cmluZyhjdXJyQXJyYXlbaV0pO1xuICAgIH1cbiAgfVxuXG4gIHNlbGVjdGVkVGltZSgpIHtcbiAgICBsZXQgdGltZUludGVydmFsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0aW1lSW50ZXJ2YWxcIik7XG4gICAgaWYgKCF0aW1lSW50ZXJ2YWwpIHtcbiAgICAgIHRpbWVJbnRlcnZhbCA9IFwic2hvdzEySG91clwiO1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0aW1lSW50ZXJ2YWxcIiwgXCJzaG93MTJIb3VyXCIpO1xuICAgIH1cbiAgfVxuXG4gIGV4Y2hhbmdlQ3VycmVuY3koKSB7XG4gICAgbGV0IGV4Y2hhbmdlQ3VyciA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiZXhjaGFuZ2VDdXJyXCIpO1xuICAgIGlmICghZXhjaGFuZ2VDdXJyKSB7XG4gICAgICBleGNoYW5nZUN1cnIgPSBcInNob3cxMkhvdXJcIjtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiZXhjaGFuZ2VDdXJyXCIsIFwiVVNEXCIpO1xuICAgIH1cbiAgICAkKFwiI2Nob29zZUN1cnJlbmN5IG9wdGlvblwiKS5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJCh0aGlzKS50ZXh0KCkgPT0gZXhjaGFuZ2VDdXJyO1xuICAgIH0pLnByb3AoJ3NlbGVjdGVkJywgdHJ1ZSk7XG5cbiAgICB0aGlzLmNvaW5MaXN0LmNvbnZlcnRUbyA9ICQoXCIjY2hvb3NlQ3VycmVuY3lcIikudmFsKCk7XG4gIH1cbiAgYWRkQ3VycmVuY3lGcm9tU3RyaW5nKHN0cikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgc3RyaW5ncyA9IHN0ci5tYXRjaCgvKC4qKVxcKCguKilcXCkuKi8pO1xuICAgIGlmIChzdHJpbmdzLmxlbmd0aCA8IDMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGN1cnJOYW1lID0gc3RyaW5nc1sxXTtcbiAgICB2YXIgbmV3Q3VyciA9IHN0cmluZ3NbMl0ucmVwbGFjZShcIipcIiwgXCJcIik7XG5cbiAgICBpZiAoJChcIiNjdXJybGlzdD4jXCIgKyBuZXdDdXJyKS5sZW5ndGggPT09IDApIHtcbiAgICAgICQoXCIjY3Vycmxpc3RcIikuYXBwZW5kKGA8c3BhbiBpZD1cIiR7bmV3Q3Vycn1cIiBkYXRhLWxvbmduYW1lPVwiJHtjdXJyTmFtZX1cIiB0aXRsZT1cIiR7Y3Vyck5hbWV9IC0gY2xpY2sgdG8gcmVtb3ZlXCI+JHtuZXdDdXJyfTwvc3Bhbj5gKTtcbiAgICAgICQoXCIjY3Vycmxpc3Q+I1wiICsgbmV3Q3VycikuY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiLCBEcmF3R3JhcGguZ2VuZXJhdGVDb2xvcihuZXdDdXJyICsgXCIvXCIgKyBuZXdDdXJyKSk7XG5cbiAgICAgICQoXCIjY3Vycmxpc3Q+I1wiICsgbmV3Q3VycikuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgIHNlbGYudXBkYXRlQ3VycmVuY3lMaXN0KCk7XG4gICAgICAgIHNlbGYuY29pbkxpc3Quc2hvd0xhc3Qoc2VsZi5ncmFwaCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgJChgI2N1cnJsaXN0PiMke25ld0N1cnJ9YCkuYnV0dG9uKCk7XG4gIH1cblxuICBsb2FkU3RvcmFnZSgpIHtcbiAgICB2YXIgc3RvcmFnZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiY3VycmVuY2llc1wiKTtcbiAgICBpZiAoIXN0b3JhZ2UpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiY3VycmVuY2llc1wiLCBbXCJCaXRjb2luIChCVEMpXCIsIFwiRXRoZXJ1bSAoRVRIKVwiLCBcIkxpdGVjb2luIChMVEMpXCIsIFwiRGlnaXRhbENhc2ggKERBU0gpXCIsIFwiRG9nZWNvaW4gKERPR0UpXCJdKTtcbiAgICAgIHJldHVybiBpbml0aWFsQ3VycmVuY2llcztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGFycmF5ID0gc3RvcmFnZS5zcGxpdChcIixcIik7XG4gICAgICBmb3IgKHZhciBpIGluIGFycmF5KSB7XG4gICAgICAgIGlmIChhcnJheVtpXS5tYXRjaCgvKC4qKVxcKCguKilcXCkuKi8pLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImN1cnJlbmNpZXNcIiwgaW5pdGlhbEN1cnJlbmNpZXMpO1xuICAgICAgICAgIHJldHVybiBpbml0aWFsQ3VycmVuY2llcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZUN1cnJlbmN5TGlzdCgpIHtcbiAgICB2YXIgY3VyclN0cmluZyA9IFwiXCI7XG4gICAgdmFyIGN1cnJlbmN5TmFtZXMgPSBbXTtcbiAgICAkKFwiI2N1cnJsaXN0PnNwYW5cIikuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIGN1cnJTdHJpbmcgKz0gdGhpcy5pZCArIFwiLFwiO1xuICAgICAgY3VycmVuY3lOYW1lcy5wdXNoKCQodGhpcykuZGF0YShcImxvbmduYW1lXCIpICsgYCgke3RoaXMuaWR9KWApO1xuICAgIH0pO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiY3VycmVuY2llc1wiLCBjdXJyZW5jeU5hbWVzKTtcblxuICAgIGN1cnJTdHJpbmcgPSBjdXJyU3RyaW5nLnNsaWNlKDAsIC0xKTtcbiAgICB0aGlzLmNvaW5MaXN0LnVwZ3JhZGVDdXJyTGlzdChjdXJyU3RyaW5nKTtcbiAgfVxuXG4gIGluaXRJbnRlcmZhY2UoZ3JhcGgsIGNvaW5MaXN0LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC50YXJnZXQgIT0gd2luZG93ICYmICQoZXZlbnQudGFyZ2V0KS5maW5kKFwiLnJlbmRlckNhbnZhc1wiKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNlbGYucmVzaXplV2luZG93KGV2ZW50LnRhcmdldCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkKFwiI2N1cnJlbmN5XCIpLmNoYW5nZShmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuYWRkQ3VycmVuY3lGcm9tU3RyaW5nKCQoXCIjY3VycmVuY3lcIikudmFsKCkpO1xuICAgICAgc2VsZi51cGRhdGVDdXJyZW5jeUxpc3QoKTtcbiAgICAgIHNlbGYuY29pbkxpc3Quc2hvd0xhc3Qoc2VsZi5ncmFwaCk7XG4gICAgICAkKFwiI2N1cnJlbmN5XCIpLnZhbChcIlwiKTtcbiAgICB9KTtcblxuICAgIC8qIGdlbmVyYXRlIHJhZGlvIGJ1dHRvbnMgKi9cbiAgICBmZXRjaChcImxpYi9zZXR0aW5ncy9idXR0b25MaXN0Lmpzb25cIikudGhlbigocmVzb2x2ZWQpID0+IHtcbiAgICAgIHJldHVybiByZXNvbHZlZC5qc29uKCk7XG4gICAgfSkudGhlbigoYnV0dG9uc0xpc3QpID0+IHtcbiAgICAgIGZvciAobGV0IGkgaW4gYnV0dG9uc0xpc3QpIHtcbiAgICAgICAgJChcIiNjb250cm9sXCIpLmFwcGVuZChgPGlucHV0IGlkPVwiJHtidXR0b25zTGlzdFtpXS5pZH1cIiB0eXBlPVwicmFkaW9cIiBuYW1lPVwiaW50ZXJ2YWxcIj48bGFiZWwgZm9yPVwiJHtidXR0b25zTGlzdFtpXS5pZH1cIiBjbGFzcz1cImludGVydmFsTGFiZWxcIj4ke2J1dHRvbnNMaXN0W2ldLmNhcHRpb259PC9sYWJlbD48YnIgLz5gKTtcbiAgICAgICAgKChpKSA9PiB7XG4gICAgICAgICAgJChcIiNcIiArIGJ1dHRvbnNMaXN0W2ldLmlkKS5jbGljayggKCkgPT4ge1xuICAgICAgICAgICAgY29pbkxpc3Quc2hvd0xhc3Qoc2VsZi5ncmFwaCwgYnV0dG9uc0xpc3RbaV0udGltZSwgYnV0dG9uc0xpc3RbaV0uY291bnQpO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0aW1lSW50ZXJ2YWxcIiwgYnV0dG9uc0xpc3RbaV0uaWQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KShpKTtcblxuICAgICAgfVxuICAgICAgJChcIiNjb250cm9sPmlucHV0XCIpLmNoZWNrYm94cmFkaW8oe1xuICAgICAgICBpY29uOiBmYWxzZSxcbiAgICAgICAgY2xhc3Nlczoge1xuICAgICAgICAgIFwidWktY2hlY2tib3hyYWRpb1wiOiBcImhpZ2hsaWdodFwiXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAkKFwiI1wiICsgbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0aW1lSW50ZXJ2YWxcIikpLmNsaWNrKCk7XG5cbiAgICB9KTtcblxuICAgICQoXCIjY2hvb3NlQ3VycmVuY3lcIikuY2hhbmdlKGZ1bmN0aW9uKCkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJleGNoYW5nZUN1cnJcIiwgJChcIiNjaG9vc2VDdXJyZW5jeVwiKS52YWwoKSk7XG4gICAgICBjb2luTGlzdC5jb252ZXJ0VG8gPSAkKFwiI2Nob29zZUN1cnJlbmN5XCIpLnZhbCgpO1xuICAgICAgY29pbkxpc3Quc2hvd0xhc3Qoc2VsZi5ncmFwaCk7XG4gICAgfSk7XG5cbiAgICBsZXQgY3VycmVuY3kgPSAkKFwiI2N1cnJlbmN5V2luZG93XCIpLmRpYWxvZyh7XG4gICAgICBjbG9zZU9uRXNjYXBlOiBmYWxzZSxcbiAgICAgIHdpZHRoOiA2MDAsXG4gICAgICBoZWlnaHQ6IDE0MCxcbiAgICAgIG1pbldpZHRoOiA2MDAsXG4gICAgICBkaWFsb2dDbGFzczogXCJuby1jbG9zZVwiLFxuICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgbXk6IFwibGVmdCBib3R0b21cIixcbiAgICAgICAgYXQ6IFwibGVmdCB0b3BcIixcbiAgICAgICAgb2Y6IHdpbmRvd1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IHdpbldpZHRoID0gd2luZG93LmlubmVyV2lkdGggKiAwLjk7XG4gICAgbGV0IHdpbkhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCAqIDAuNzc7XG4gICAgJChcIiNyZW5kZXJDYW52YXNcIikuZGlhbG9nKHtcbiAgICAgIGNsb3NlT25Fc2NhcGU6IGZhbHNlLFxuICAgICAgd2lkdGg6IHdpbldpZHRoLFxuICAgICAgaGVpZ2h0OiB3aW5IZWlnaHQsXG4gICAgICBkaWFsb2dDbGFzczogXCJuby1jbG9zZVwiLFxuICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgbXk6IFwibGVmdCB0b3BcIixcbiAgICAgICAgYXQ6IFwibGVmdCBib3R0b21cIixcbiAgICAgICAgb2Y6IGN1cnJlbmN5XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgc3ZnID0gZDMuc2VsZWN0KFwiI3JlbmRlckNhbnZhc1wiKS5hcHBlbmQoXCJzdmc6c3ZnXCIpLmF0dHIoXCJpZFwiLCBcInN2Z1wiKTtcbiAgICBkMy5zZWxlY3QoXCJzdmdcIikuYXR0cihcIndpZHRoXCIsICh3aW5XaWR0aCAtIDE1MCkpLmF0dHIoXCJoZWlnaHRcIiwgKHdpbkhlaWdodCAtIDUwKSk7XG5cbiAgICB0aGlzLmdyYXBoID0gbmV3IERyYXdHcmFwaChzdmcsIDUwLCA1NSwgNSwgMTAwLCAyMCwgd2luV2lkdGggLSAxNTUsIHdpbkhlaWdodCAtIDUwKTtcblxuICAgICQoXCIjYWRkSW1nXCIpLmRldGFjaCgpLmFwcGVuZFRvKCQoXCIjcmVuZGVyQ2FudmFzXCIpLnBhcmVudCgpLmZpbmQoXCIudWktZGlhbG9nLXRpdGxlYmFyPi51aS1kaWFsb2ctdGl0bGVcIikpO1xuICAgICQoXCIjYWRkSW1nXCIpLmJ1dHRvbigpO1xuXG4gICAgJChcIiNjdXJyZW5jeVdpbmRvd1wiKS5kaWFsb2coKTtcbiAgICAvLyQoXCIjY29udHJvbFwiKS5kaWFsb2coKTtcblxuICAgICQoXCIjYWRkSW1nXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXG4gICAgICBsZXQgc2VyaWFsaXplciA9IG5ldyBYTUxTZXJpYWxpemVyKCk7XG5cbiAgICAgIGxldCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgYS5kb3dubG9hZCA9ICdjcnlwdG9jaGFydC5zdmcnO1xuICAgICAgYS50eXBlID0gJ2ltYWdlL3N2Zyt4bWwnO1xuICAgICAgdmFyIGJsb2IgPSBuZXcgQmxvYihbJzw/eG1sIHZlcnNpb249XCIxLjBcIiBzdGFuZGFsb25lPVwibm9cIj8+XFxyXFxuJyArIHNlcmlhbGl6ZXIuc2VyaWFsaXplVG9TdHJpbmcoJChcIiNzdmdcIilbMF0pXSwge1widHlwZVwiOiBcImltYWdlL3N2Zyt4bWxcIn0pO1xuICAgICAgYS5ocmVmID0gKHdpbmRvdy5VUkwgfHwgd2Via2l0VVJMKS5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICBhLmNsaWNrKCk7XG4gICAgICAkKGEpLmRldGFjaCgpO1xuXG4gICAgfSk7XG4gIH1cblxuICByZXNpemVXaW5kb3codGFyZ2V0KSB7XG4gICAgZDMuc2VsZWN0KFwic3ZnXCIpLmF0dHIoXCJ3aWR0aFwiLCAoJCh0YXJnZXQpLndpZHRoKCkgLSAxMTApKS5hdHRyKFwiaGVpZ2h0XCIsICgkKHRhcmdldCkuaGVpZ2h0KCkgLSA1MCkpO1xuICAgIHRoaXMuZ3JhcGgucmVzaXplKDUwLCA1NSwgNSwgMTAwLCAyMCwgJCh0YXJnZXQpLndpZHRoKCkgLSAxMTAsICQodGFyZ2V0KS5oZWlnaHQoKSAtIDUwKTtcblxuICB9XG59XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICB2YXIgbWFpbiA9IG5ldyBNYWluKCk7XG4gIG1haW4uaW5pdCgpO1xufSk7XG4iXX0=
