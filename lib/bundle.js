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
        // console.log(buttonsList);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4xMC4yL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2FwaS5qcyIsInNyYy9jb2lubGlzdC5qcyIsInNyYy9jdXJyZW5jeS5qcyIsInNyYy9kcmF3R3JhcGguanMiLCJzcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUNBQTs7SUFFYSxXLFdBQUEsVztBQUNYLHlCQUFjO0FBQUE7QUFBRTs7OztrQ0FDRixjLEVBQWdCLEksRUFBTSxVLEVBQVksVyxFQUEwQjtBQUFBLFVBQWIsT0FBYSx1RUFBSCxDQUFHOztBQUN4RSxVQUFJLE9BQU8sSUFBWDtBQUNBLFVBQUksUUFBUSxVQUFaLEVBQXdCO0FBQ3RCLGVBQU8sUUFBUSxPQUFSLENBQWdCLEtBQUssT0FBTCxDQUFhLGNBQWIsRUFBNkIsV0FBN0IsQ0FBaEIsQ0FBUDtBQUNEO0FBQ0QsYUFBTyxNQUFNLGlEQUFpRCxjQUFqRCxHQUFrRSxRQUFsRSxHQUE2RSxJQUE3RSxHQUFvRixRQUFwRixHQUErRixVQUEvRixHQUE0RyxTQUE1RyxHQUF3SCxXQUE5SCxFQUEySSxJQUEzSSxDQUFnSixVQUFTLFFBQVQsRUFBbUI7QUFDeEssZUFBTyxTQUFTLElBQVQsRUFBUDtBQUNELE9BRk0sRUFFSixJQUZJLENBRUMsVUFBUyxJQUFULEVBQWU7QUFDckIsWUFBSSxLQUFLLFFBQUwsSUFBaUIsT0FBckIsRUFBOEI7QUFDNUIsY0FBSSxVQUFVLENBQWQsRUFBaUI7QUFDZixtQkFBTyxLQUFLLGFBQUwsQ0FBbUIsY0FBbkIsRUFBbUMsSUFBbkMsRUFBeUMsVUFBekMsRUFBcUQsV0FBckQsRUFBa0UsVUFBVSxDQUE1RSxDQUFQO0FBQ0Q7QUFDRixTQUpELE1BSU87QUFDTCxpQkFBUSxJQUFSO0FBQ0Q7QUFDRixPQVZNLENBQVA7QUFXRDs7O2lDQUVZ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QUF0QixFQUFnQyxFQUFFLE1BQUYsRUFBVSxLQUFWLEtBQW9CLEdBQXBELEVBQTBELElBQTFELENBQStELFFBQS9ELEVBQTBFLEVBQUUsTUFBRixFQUFVLE1BQVYsS0FBcUIsRUFBL0Y7QUFDQSxXQUFLLEtBQUwsQ0FBVyxNQUFYLENBQWtCLEVBQWxCLEVBQXNCLEVBQXRCLEVBQTBCLENBQTFCLEVBQTZCLEdBQTdCLEVBQWtDLEVBQWxDLEVBQXNDLEVBQUUsTUFBRixFQUFVLEtBQVYsS0FBb0IsR0FBMUQsRUFBK0QsRUFBRSxNQUFGLEVBQVUsTUFBVixLQUFxQixFQUFwRjtBQUVEOzs7Ozs7QUFHSCxFQUFFLFFBQUYsRUFBWSxLQUFaLENBQWtCLFlBQVc7QUFDM0IsTUFBSSxPQUFPLElBQUksSUFBSixFQUFYO0FBQ0EsT0FBSyxJQUFMO0FBQ0QsQ0FIRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuXG5leHBvcnQgY2xhc3MgQ3VycmVuY3lBUEkge1xuICBjb25zdHJ1Y3RvcigpIHt9XG4gIGdldEhpc3RvcmljYWwoaG91cnNPck1pbnV0ZXMsIG5hbWUsIGNvbnZlcnNpb24sIHZhbHVlc0NvdW50LCBjb3VudGVyID0gMCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAobmFtZSA9PSBjb252ZXJzaW9uKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHNlbGYuYWx3YXlzMShob3Vyc09yTWludXRlcywgdmFsdWVzQ291bnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIGZldGNoKFwiaHR0cHM6Ly9taW4tYXBpLmNyeXB0b2NvbXBhcmUuY29tL2RhdGEvaGlzdG9cIiArIGhvdXJzT3JNaW51dGVzICsgXCI/ZnN5bT1cIiArIG5hbWUgKyBcIiZ0c3ltPVwiICsgY29udmVyc2lvbiArIFwiJmxpbWl0PVwiICsgdmFsdWVzQ291bnQpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgfSkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICBpZiAoZGF0YS5SZXNwb25zZSA9PSBcIkVycm9yXCIpIHtcbiAgICAgICAgaWYgKGNvdW50ZXIgPCA1KSB7XG4gICAgICAgICAgcmV0dXJuIHNlbGYuZ2V0SGlzdG9yaWNhbChob3Vyc09yTWludXRlcywgbmFtZSwgY29udmVyc2lvbiwgdmFsdWVzQ291bnQsIGNvdW50ZXIgKyAxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIChkYXRhKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldEN1cnJlbnQoKSB7fVxuXG4gIGdldENvaW5zKCkge1xuICAgIHJldHVybiBmZXRjaChcImh0dHBzOi8vbWluLWFwaS5jcnlwdG9jb21wYXJlLmNvbS9kYXRhL2FsbC9jb2lubGlzdFwiKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgIH0pO1xuICB9XG5cbiAgYWx3YXlzMShob3Vyc09yTWludXRlcywgdmFsdWVzQ291bnQpIHtcbiAgICBsZXQgaW50ZXJ2YWwgPSA2MDtcbiAgICBpZiAoaG91cnNPck1pbnV0ZXMgPT0gXCJob3VyXCIpIHtcbiAgICAgIGludGVydmFsID0gMzYwMDtcbiAgICB9XG4gICAgaWYgKGhvdXJzT3JNaW51dGVzID09IFwiZGF5XCIpIHtcbiAgICAgIGludGVydmFsID0gMzYwMCAqIDI0O1xuICAgIH1cbiAgICBsZXQgY3VycmVudFRpbWUgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcbiAgICBjdXJyZW50VGltZSAtPSBjdXJyZW50VGltZSAlIGludGVydmFsO1xuICAgIGxldCB0aW1lRnJvbSA9IGN1cnJlbnRUaW1lIC0gaW50ZXJ2YWwgKiB2YWx1ZXNDb3VudDtcblxuICAgIHZhciBkYXRhID0ge1xuICAgICAgVGltZVRvOiBjdXJyZW50VGltZSxcbiAgICAgIFRpbWVGcm9tOiB0aW1lRnJvbSxcbiAgICAgIERhdGE6IFtcbiAgICAgICAge1xuICAgICAgICAgIGNsb3NlOiAxLFxuICAgICAgICAgIHRpbWU6IHRpbWVGcm9tXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBjbG9zZTogMSxcbiAgICAgICAgICB0aW1lOiBjdXJyZW50VGltZVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7Q3VycmVuY3lBUEl9O1xuIiwiLyoganNoaW50IGVzdmVyc2lvbjogNiAqL1xuaW1wb3J0IHtDdXJyZW5jeX0gZnJvbSAnLi9jdXJyZW5jeS5qcyc7XG5cbmV4cG9ydCBjbGFzcyBDb2lubGlzdCB7XG4gIGNvbnN0cnVjdG9yKGFwaSkge1xuICAgIHRoaXMubXlDdXJyID0gW107XG4gICAgdGhpcy5ncmFwaCA9IG51bGw7XG4gICAgdGhpcy5jdXJyZW5jaWVzID0gW107XG4gICAgdGhpcy5ob3VyT3JNaW4gPSBcIm1pbnV0ZVwiO1xuICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgdGhpcy5jb252ZXJ0VG8gPSBcIlVTRFwiO1xuICAgIHRoaXMudmFsdWVzQ291bnQgPSA3MjA7XG4gICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmFwaSA9IGFwaTtcbiAgfVxuXG4gIHVwZ3JhZGVDdXJyTGlzdChzdHIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5teUN1cnIgPSBzdHIuc3BsaXQoXCIsXCIpO1xuICAgIHRoaXMubXlDdXJyLm1hcChmdW5jdGlvbih2YWwsIGluZGV4KSB7XG4gICAgICBpZiAodmFsID09PSBcIlwiKSB7XG4gICAgICAgIHNlbGYubXlDdXJyLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzaG93TGFzdChncmFwaCwgaG91ck9yTWluID0gbnVsbCwgdmFsdWVzQ291bnQgPSBudWxsKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCF0aGlzLmlzTG9hZGluZykge1xuICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5ncmFwaCA9IGdyYXBoIHx8IHRoaXMuZ3JhcGg7XG5cbiAgICBpZiAodGhpcy5pbnRlcnZhbCkge1xuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKTtcbiAgICAgIHRoaXMuaW50ZXJ2YWwgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChob3VyT3JNaW4gIT09IG51bGwpIHtcbiAgICAgIHRoaXMuaG91ck9yTWluID0gaG91ck9yTWluO1xuICAgIH1cbiAgICBpZiAodmFsdWVzQ291bnQgIT09IG51bGwpIHtcbiAgICAgIHRoaXMudmFsdWVzQ291bnQgPSB2YWx1ZXNDb3VudDtcbiAgICB9XG5cbiAgICB0aGlzLmNvdW50ZXIgPSAwO1xuXG4gICAgdGhpcy5jdXJyZW5jaWVzID0gW107XG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLm15Q3Vycikge1xuICAgICAgdmFyIGN1cnIgPSBuZXcgQ3VycmVuY3kodGhpcy5teUN1cnJbaV0sIHRoaXMuY29udmVydFRvKTtcbiAgICAgIGN1cnIuZ2V0SGlzdG9yaWNMYXN0KHRoaXMsIGkpO1xuICAgICAgdGhpcy5jdXJyZW5jaWVzLnB1c2goY3Vycik7XG4gICAgfVxuXG4gICAgdmFyIHRpbWVvdXQgPSAwO1xuICAgIGlmICh0aGlzLmhvdXJPck1pbiA9PSBcIm1pbnV0ZVwiKSB7XG4gICAgICB0aW1lb3V0ID0gNjAwMDAgLSBEYXRlLm5vdygpICUgNjAwMDA7XG4gICAgICBpZiAodGltZW91dCA9PSAwKVxuICAgICAgICB0aW1lb3V0ICs9IDYwMDAwO1xuICAgICAgfVxuICAgIGlmICh0aGlzLmhvdXJPck1pbiA9PSBcImhvdXJcIikge1xuICAgICAgdGltZW91dCA9IDM2MDAwMDAgLSBEYXRlLm5vdygpICUgMzYwMDAwMDtcbiAgICAgIGlmICh0aW1lb3V0ID09IDApXG4gICAgICAgIHRpbWVvdXQgKz0gMzYwMDAwMDtcbiAgICAgIH1cbiAgICBpZiAodGhpcy5ob3VyT3JNaW4gIT0gXCJkYXlcIikge1xuICAgICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNob3dMYXN0KGdyYXBoKTtcbiAgICAgIH0sIHRpbWVvdXQpO1xuICAgIH1cbiAgfVxuXG4gIGluY3JlYXNlQ291bnRlcigpIHtcbiAgICB0aGlzLmNvdW50ZXIrKztcbiAgICBpZiAodGhpcy5jb3VudGVyID49IHRoaXMubXlDdXJyLmxlbmd0aCkge1xuICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuZ3JhcGguZHJhd0dyYXBoKHRoaXMsIHRoaXMuaG91ck9yTWluLCB0aGlzLnZhbHVlc0NvdW50KTtcbiAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgfVxuICB9XG59XG4iLCIvKiBqc2hpbnQgZXN2ZXJzaW9uOiA2ICovXG5leHBvcnQgY2xhc3MgQ3VycmVuY3kge1xuICBjb25zdHJ1Y3RvcihuYW1lLCBjb252LCBsb25nID0gbnVsbCkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5sb25nbmFtZSA9IGxvbmcgfHwgbmFtZTtcbiAgICB0aGlzLmNvbnZlcnNpb24gPSBjb252O1xuICAgIC8vICAgIHRoaXMuaW5kZXggPSAwO1xuICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgc2VsZi52YWx1ZXMgPSBbXTtcbiAgfVxuXG4gIGdldEhpc3RvcmljTGFzdChjb2lubGlzdCwgaW5kKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIC8vdGhpcy5pbmRleCA9IGluZDtcblxuICAgIHZhciBob3Vyc09yTWludXRlcyA9IGNvaW5saXN0LmhvdXJPck1pbjtcblxuICAgIGNvaW5saXN0LmFwaS5nZXRIaXN0b3JpY2FsKGhvdXJzT3JNaW51dGVzLCB0aGlzLm5hbWUsIHRoaXMuY29udmVyc2lvbiwgY29pbmxpc3QudmFsdWVzQ291bnQpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgc2VsZi5zYXZlR3JhcGgoZGF0YSk7XG4gICAgICBjb2lubGlzdC5pbmNyZWFzZUNvdW50ZXIoKTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbigpIHtcbiAgICAgIGNvaW5saXN0LmluY3JlYXNlQ291bnRlcigpO1xuICAgIH0pO1xuICB9XG5cbiAgc2F2ZUdyYXBoKGRhdGEpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi52YWx1ZXMgPSBbXTtcbiAgICBpZiAoZGF0YS5SZXNwb25zZSA9PSBcIkVycm9yXCIpIHtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiIEVycm9yXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGYudmFsdWVzLm1heCA9IGRhdGEuRGF0YS5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KGEsIGIuY2xvc2UpO1xuICAgIH0sIDApO1xuXG4gICAgc2VsZi52YWx1ZXMubWluID0gZGF0YS5EYXRhLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gTWF0aC5taW4oYSwgYi5jbG9zZSk7XG4gICAgfSwgc2VsZi52YWx1ZXMubWF4KTtcblxuICAgIHNlbGYudmFsdWVzLm1pZCA9IChzZWxmLnZhbHVlcy5tYXggKyBzZWxmLnZhbHVlcy5taW4pIC8gMjtcblxuICAgIHNlbGYudmFsdWVzLm1heFJlbGF0aXZlID0gc2VsZi52YWx1ZXMubWF4IC8gc2VsZi52YWx1ZXMubWlkICogMTAwIC0gMTAwO1xuICAgIHNlbGYudmFsdWVzLmRhdGEgPSBbXTtcbiAgICBzZWxmLnZhbHVlcy50aW1lVG8gPSBkYXRhLlRpbWVUbztcbiAgICBzZWxmLnZhbHVlcy50aW1lRnJvbSA9IGRhdGEuVGltZUZyb207XG5cbiAgICBmb3IgKGxldCBpIGluIGRhdGEuRGF0YSkge1xuICAgICAgc2VsZi52YWx1ZXMuZGF0YS5wdXNoKHtcbiAgICAgICAgY2xvc2U6IGRhdGEuRGF0YVtpXS5jbG9zZSxcbiAgICAgICAgcmVsYXRpdmU6IChkYXRhLkRhdGFbaV0uY2xvc2UgLSBzZWxmLnZhbHVlcy5taWQpIC8gc2VsZi52YWx1ZXMubWlkICogMTAwLFxuICAgICAgICB0aW1lOiBkYXRhLkRhdGFbaV0udGltZVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iLCIvKiBqc2hpbnQgZXN2ZXJzaW9uOiA2ICovXG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS93YmtkL2QzLWV4dGVuZGVkXG5kMy5zZWxlY3Rpb24ucHJvdG90eXBlLm1vdmVUb0Zyb250ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMpO1xuICB9KTtcbn07XG5kMy5zZWxlY3Rpb24ucHJvdG90eXBlLm1vdmVUb0JhY2sgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICB2YXIgZmlyc3RDaGlsZCA9IHRoaXMucGFyZW50Tm9kZS5maXJzdENoaWxkO1xuICAgIGlmIChmaXJzdENoaWxkKSB7XG4gICAgICB0aGlzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMsIGZpcnN0Q2hpbGQpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5leHBvcnQgY2xhc3MgRHJhd0dyYXBoIHtcbiAgY29uc3RydWN0b3Ioc3ZnLCBzdGFydFgsIHN0YXJ0WSwgYnV0dG9uWSwgYnV0dFdpZHRoLCBidXR0SGVpZ2h0LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy5zdmcgPSBzdmc7XG4gICAgdGhpcy5zdGFydFggPSBzdGFydFg7XG4gICAgdGhpcy5zdGFydFkgPSBzdGFydFk7XG4gICAgdGhpcy5idXR0b25ZID0gYnV0dG9uWTtcbiAgICB0aGlzLmJ1dHRvbldpZHRoID0gYnV0dFdpZHRoO1xuICAgIHRoaXMuYnV0dG9uSGVpZ2h0ID0gYnV0dEhlaWdodDtcblxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IC0gc3RhcnRZICogMiAtIDEwO1xuICAgIHRoaXMud2lkdGggPSB3aWR0aCAtIHN0YXJ0WCAtIDEwO1xuXG4gICAgdGhpcy5kaXYgPSBkMy5zZWxlY3QoXCJib2R5XCIpLmFwcGVuZChcImRpdlwiKS5hdHRyKFwiY2xhc3NcIiwgXCJ0b29sdGlwXCIpLnN0eWxlKFwib3BhY2l0eVwiLCAwKTtcbiAgICB0aGlzLnJlc2V0UGFwZXIoKTtcbiAgfVxuXG4gIHJlc2l6ZShzdGFydFgsIHN0YXJ0WSwgYnV0dG9uWSwgYnV0dFdpZHRoLCBidXR0SGVpZ2h0LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy5zdGFydFggPSBzdGFydFg7XG4gICAgdGhpcy5zdGFydFkgPSBzdGFydFk7XG4gICAgdGhpcy5idXR0b25ZID0gYnV0dG9uWTtcbiAgICB0aGlzLmJ1dHRvbldpZHRoID0gYnV0dFdpZHRoO1xuICAgIHRoaXMuYnV0dG9uSGVpZ2h0ID0gYnV0dEhlaWdodDtcblxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IC0gc3RhcnRZICogMiAtIDEwO1xuICAgIHRoaXMud2lkdGggPSB3aWR0aCAtIHN0YXJ0WCAtIDEwO1xuXG4gICAgdGhpcy5kcmF3R3JhcGgoKTtcbiAgfVxuXG4gIHJlc2V0UGFwZXIoKSB7XG4gICAgdGhpcy5yZXNldEdyYXBoKCk7XG4gICAgdGhpcy5jb2xvcnMgPSBbXTtcbiAgfVxuXG4gIHJlc2V0R3JhcGgoKSB7XG4gICAgdGhpcy5zdmcuc2VsZWN0QWxsKFwiKlwiKS5yZW1vdmUoKTtcbiAgfVxuXG4gIGluaXRDb2xvcnMoY3VycmVuY2llcywgc2l6ZSkge1xuXG4gICAgLy9jb25zb2xlLmxvZyhjdXJyZW5jaWVzLCBzaXplKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuXG4gICAgICB0aGlzLmNvbG9yc1tpXSA9IERyYXdHcmFwaC5nZW5lcmF0ZUNvbG9yKGN1cnJlbmNpZXNbaV0ubmFtZSArIFwiL1wiICsgY3VycmVuY2llc1tpXS5uYW1lKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZ2VuZXJhdGVDb2xvcihzdHIpIHtcbiAgICBsZXQgaGFzaCA9IDA7XG4gICAgaWYgKHN0ci5sZW5ndGggPT0gMClcbiAgICAgIHJldHVybiBoYXNoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgY2hhciA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgaGFzaCA9ICgoaGFzaCA8PCA1KSAtIGhhc2gpICsgY2hhcjtcbiAgICAgIGhhc2ggPSBoYXNoICYgaGFzaDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXG4gICAgfVxuXG4gICAgdmFyIGNvbG9ycyA9IFsweDk5MDAwMCwgMHgwMDk5MDAsIDB4MDAwMDk5XTtcblxuICAgIGhhc2ggPSAoaGFzaCkgJSAoMTY3NzcyMTYgLyogMjA5NzE1MiAxNjc3NzIxNiAqLyApOyAvL1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgMzsgaisrKSB7XG4gICAgICBjb2xvcnNbal0gPSAoKChoYXNoICYgY29sb3JzW2pdKSA+PiAoMTYgLSBqICogOCkpICsgMHgyMikudG9TdHJpbmcoMTYpO1xuICAgICAgY29sb3JzW2pdID0gKFxuICAgICAgICBjb2xvcnNbal0ubGVuZ3RoID09IDEgP1xuICAgICAgICBcIjBcIiArIGNvbG9yc1tqXSA6XG4gICAgICAgIGNvbG9yc1tqXSk7XG4gICAgfVxuICAgIC8qICBjb25zb2xlLmxvZyhzdHIsIFwiI1wiICsgKFxuICAgICAgICBjb2xvcnNbMF0gKyBjb2xvcnNbMV0gKyBjb2xvcnNbMl0pKTsqL1xuICAgIHJldHVybiAoXCIjXCIgKyAoXG4gICAgICBjb2xvcnNbMF0gKyBjb2xvcnNbMV0gKyBjb2xvcnNbMl0pKTtcbiAgfVxuXG4gIGRyYXdHcmFwaChjb2lubGlzdCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoY29pbmxpc3QpIHtcbiAgICAgIHRoaXMuY29pbmxpc3QgPSBjb2lubGlzdDtcbiAgICB9XG4gICAgaWYgKCFjb2lubGlzdCkge1xuICAgICAgY29pbmxpc3QgPSB0aGlzLmNvaW5saXN0O1xuICAgIH1cbiAgICBpZiAoIWNvaW5saXN0IHx8IGNvaW5saXN0LmlzTG9hZGluZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmVzZXRQYXBlcigpO1xuXG4gICAgdGhpcy5pbml0Q29sb3JzKGNvaW5saXN0LmN1cnJlbmNpZXMsIGNvaW5saXN0LmN1cnJlbmNpZXMubGVuZ3RoKTtcblxuICAgIHZhciBtYXhWYWwgPSBjb2lubGlzdC5jdXJyZW5jaWVzLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gTWF0aC5tYXgoYSwgYi52YWx1ZXMubWF4UmVsYXRpdmUpO1xuICAgIH0sIDApO1xuXG4gICAgdmFyIHRpbWVGcm9tID0gY29pbmxpc3QuY3VycmVuY2llcy5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIE1hdGgubWluKGEsIGIudmFsdWVzLnRpbWVGcm9tKTtcbiAgICB9LCBOdW1iZXIuTUFYX1ZBTFVFKTtcblxuICAgIHZhciB0aW1lVG8gPSBjb2lubGlzdC5jdXJyZW5jaWVzLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gTWF0aC5tYXgoYSwgYi52YWx1ZXMudGltZVRvKTtcbiAgICB9LCAwKTtcblxuICAgIHZhciBzY2FsZVkgPSBkMy5zY2FsZUxpbmVhcigpLmRvbWFpbihbXG4gICAgICAxMDAgKyBtYXhWYWwsXG4gICAgICAxMDAgLSBtYXhWYWxcbiAgICBdKS5yYW5nZShbMCwgdGhpcy5oZWlnaHRdKTtcblxuICAgIHZhciBzY2FsZVggPSBkMy5zY2FsZVRpbWUoKS5kb21haW4oW1xuICAgICAgbmV3IERhdGUodGltZUZyb20gKiAxMDAwIC0gMSksXG4gICAgICBuZXcgRGF0ZSh0aW1lVG8gKiAxMDAwICsgMSlcbiAgICBdKS5yYW5nZShbMCwgdGhpcy53aWR0aF0pO1xuXG4gICAgdmFyIHRpbWVGb3JtYXQgPSBkMy50aW1lRm9ybWF0KFwiJUg6JU0gJWQtJW0tJVlcIik7XG5cbiAgICB2YXIgeV9heGlzID0gZDMuYXhpc0xlZnQoKS50aWNrcygyMCkuc2NhbGUoc2NhbGVZKTtcbiAgICB2YXIgeF9heGlzID0gZDMuYXhpc0JvdHRvbSgpLnRpY2tzKDIwKS50aWNrRm9ybWF0KHRpbWVGb3JtYXQpLnNjYWxlKHNjYWxlWCk7XG5cbiAgICB0aGlzLnN2Zy5hcHBlbmQoXCJnXCIpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgke3RoaXMuc3RhcnRYfSwke3RoaXMuc3RhcnRZfSlgKS5jYWxsKHlfYXhpcyk7XG4gICAgdGhpcy5zdmcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHt0aGlzLnN0YXJ0WH0sICR7dGhpcy5oZWlnaHQgKyB0aGlzLnN0YXJ0WX0pYCkuY2FsbCh4X2F4aXMpLnNlbGVjdEFsbChcInRleHRcIikuc3R5bGUoXCJ0ZXh0LWFuY2hvclwiLCBcImVuZFwiKS50ZXh0KGZ1bmN0aW9uKGQpIHtcbiAgICAgIHZhciB0ID0gZDMuc2VsZWN0KHRoaXMucGFyZW50Tm9kZSkuYXBwZW5kKFwidGV4dFwiKS5zdHlsZShcInRleHQtYW5jaG9yXCIsIFwiZW5kXCIpLmF0dHIoXCJmaWxsXCIsIFwiYmxhY2tcIikudGV4dCh0aW1lRm9ybWF0KGQpLnRvU3RyaW5nKCkuc3BsaXQoXCIgXCIpWzBdKS5hdHRyKFwiZHhcIiwgXCItMS44ZW1cIikuYXR0cihcImR5XCIsIFwiLjE1ZW1cIikuYXR0cihcInRyYW5zZm9ybVwiLCBcInJvdGF0ZSgtNjUpXCIpO1xuICAgICAgcmV0dXJuIHRpbWVGb3JtYXQoZCkudG9TdHJpbmcoKS5zcGxpdChcIiBcIilbMV07XG4gICAgfSkuYXR0cihcImR4XCIsIFwiLS44ZW1cIikuYXR0cihcImR5XCIsIFwiLjE1ZW1cIikuYXR0cihcInRyYW5zZm9ybVwiLCBcInJvdGF0ZSgtNjUpXCIpO1xuXG4gICAgLy8gYWRkIHRoZSBYIGdyaWRsaW5lc1xuICAgIHRoaXMuc3ZnLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwiZ3JpZFwiKS5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHtzZWxmLnN0YXJ0WH0sICR7c2VsZi5oZWlnaHQgKyBzZWxmLnN0YXJ0WX0pYCkuY2FsbChkMy5heGlzQm90dG9tKHNjYWxlWCkudGlja3MoMTApLnRpY2tTaXplKC1zZWxmLmhlaWdodCkudGlja0Zvcm1hdChcIlwiKSk7XG5cbiAgICAvLyBhZGQgdGhlIFkgZ3JpZGxpbmVzXG4gICAgdGhpcy5zdmcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHtzZWxmLnN0YXJ0WH0sICR7c2VsZi5zdGFydFl9KWApLmF0dHIoXCJjbGFzc1wiLCBcImdyaWRcIikuY2FsbChkMy5heGlzTGVmdChzY2FsZVkpLnRpY2tzKDUpLnRpY2tTaXplKC1zZWxmLndpZHRoIC0gc2VsZi5zdGFydFgpLnRpY2tGb3JtYXQoXCJcIikpO1xuXG4gICAgdmFyIHNlbGVjdENsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoZDMuc2VsZWN0KHRoaXMucGFyZW50Tm9kZSkuc3R5bGUoXCJvcGFjaXR5XCIpID09IDEpIHtcbiAgICAgICAgZDMuc2VsZWN0QWxsKFwiLmdyYXBoXCIpLnN0eWxlKFwib3BhY2l0eVwiLCAwLjk5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGQzLnNlbGVjdEFsbChcIi5ncmFwaFwiKS5zdHlsZShcIm9wYWNpdHlcIiwgMC4xKTtcbiAgICAgICAgZDMuc2VsZWN0KHRoaXMucGFyZW50Tm9kZSkuc3R5bGUoXCJvcGFjaXR5XCIsIDEpLm1vdmVUb0Zyb250KCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vYWRkIHRleHQgYnV0dG9uc1xuICAgIHRoaXMuc3ZnLnNlbGVjdEFsbChcInJlY3RcIikuZGF0YShjb2lubGlzdC5jdXJyZW5jaWVzKS5lbnRlcigpLmFwcGVuZChcInJlY3RcIikuYXR0cihcInhcIiwgZnVuY3Rpb24oZCwgaW5kKSB7XG4gICAgICByZXR1cm4gc2VsZi5zdGFydFggKyBpbmQgKiBzZWxmLmJ1dHRvbldpZHRoO1xuICAgIH0pLmF0dHIoXCJ3aWR0aFwiLCBzZWxmLmJ1dHRvbldpZHRoKS5hdHRyKFwiaGVpZ2h0XCIsIHNlbGYuYnV0dG9uSGVpZ2h0ICogMS44KS5hdHRyKFwieVwiLCBzZWxmLmJ1dHRvblkpLmF0dHIoXCJmaWxsXCIsIGZ1bmN0aW9uKGQsIGluZCkge1xuICAgICAgcmV0dXJuIHNlbGYuY29sb3JzW2luZF07XG4gICAgfSkuYXR0cihcImNsYXNzXCIsIFwiYnV0dG9uXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgc2VsZi5zdmcuc2VsZWN0KFwiLmdyYXBoLmNfXCIgKyBkLm5hbWUgKyBcIiA+IHBhdGhcIikubm9kZSgpLmRpc3BhdGNoRXZlbnQobmV3IE1vdXNlRXZlbnQoXCJjbGlja1wiKSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnN2Zy5zZWxlY3RBbGwoXCJ0ZXh0LmJ1dHRvbkxhYmVsXCIpLmRhdGEoY29pbmxpc3QuY3VycmVuY2llcykuZW50ZXIoKS5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uKGQsIGluZCkge1xuICAgICAgcmV0dXJuIHNlbGYuc3RhcnRYICsgaW5kICogc2VsZi5idXR0b25XaWR0aCArIHNlbGYuYnV0dG9uV2lkdGggKiAwLjU7XG4gICAgfSkuYXR0cihcImZpbGxcIiwgZnVuY3Rpb24oZCwgaW5kKSB7XG4gICAgICByZXR1cm4gc2VsZi5jb2xvcnNbaW5kXTtcbiAgICB9KS5hdHRyKFwieVwiLCBzZWxmLmJ1dHRvblkgKyBzZWxmLmJ1dHRvbkhlaWdodCAqIDAuNikudGV4dChmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gZC5uYW1lO1xuICAgIH0pLmF0dHIoXCJjbGFzc1wiLCBcImJ1dHRvbkxhYmVsXCIpLmF0dHIoXCJmb250LXNpemVcIiwgc2VsZi5idXR0b25IZWlnaHQgKiAwLjYpLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBcIm1pZGRsZVwiKTtcblxuICAgIHRoaXMuc3ZnLnNlbGVjdEFsbChcInRleHQuY2FwdGlvblwiKS5kYXRhKGNvaW5saXN0LmN1cnJlbmNpZXMpLmVudGVyKCkuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwieFwiLCBmdW5jdGlvbihkLCBpbmQpIHtcbiAgICAgIHJldHVybiBzZWxmLnN0YXJ0WCArIGluZCAqIHNlbGYuYnV0dG9uV2lkdGggKyBzZWxmLmJ1dHRvbldpZHRoICogMC41O1xuICAgIH0pLmF0dHIoXCJ5XCIsIHNlbGYuYnV0dG9uWSArIHNlbGYuYnV0dG9uSGVpZ2h0ICogMC42ICogMikudGV4dChmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gZC52YWx1ZXMuZGF0YVtkLnZhbHVlcy5kYXRhLmxlbmd0aCAtIDFdLmNsb3NlO1xuICAgIH0pLmF0dHIoXCJjbGFzc1wiLCBcImJ1dHRvbkxhYmVsIGNhcHRpb25cIikuYXR0cihcImZpbGxcIiwgZnVuY3Rpb24oZCwgaW5kKSB7XG4gICAgICByZXR1cm4gc2VsZi5jb2xvcnNbaW5kXTtcbiAgICB9KS5hdHRyKFwiZm9udC1zaXplXCIsIHNlbGYuYnV0dG9uSGVpZ2h0ICogMC42KS5hdHRyKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIik7XG5cbiAgICAvL2RyYXdncmFwaFxuICAgIHZhciB2YWx1ZWxpbmUgPSBkMy5saW5lKCkueChmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gc2NhbGVYKGQudGltZSAqIDEwMDApO1xuICAgIH0pLnkoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIHNjYWxlWShkLnJlbGF0aXZlICsgMTAwKTtcbiAgICB9KTtcblxuICAgIGNvaW5saXN0LmN1cnJlbmNpZXMuZm9yRWFjaChmdW5jdGlvbihjdXJyLCBpbmRleCkge1xuICAgICAgbGV0IGcgPSBzZWxmLnN2Zy5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImdyYXBoIGNfXCIgKyBjdXJyLm5hbWUpO1xuICAgICAgZy5hcHBlbmQoXCJwYXRoXCIpLmRhdGEoW2N1cnIudmFsdWVzLmRhdGFdKS5hdHRyKFwiY2xhc3NcIiwgXCJwYXRoIGNfXCIgKyBjdXJyLm5hbWUpLmF0dHIoXCJkXCIsIHZhbHVlbGluZSkuYXR0cihcImZpbGxcIiwgXCJ0cmFuc3BhcmVudFwiKS5hdHRyKFwic3Ryb2tlXCIsIHNlbGYuY29sb3JzW2luZGV4XSkuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7c2VsZi5zdGFydFh9LCR7c2VsZi5zdGFydFl9KWApLm9uKFwiY2xpY2tcIiwgc2VsZWN0Q2xpY2spLm1vdmVUb0JhY2soKTtcblxuICAgICAgZy5zZWxlY3RBbGwoXCJjaXJjbGUgLmNfXCIgKyBjdXJyLm5hbWUpLmRhdGEoY3Vyci52YWx1ZXMuZGF0YSkuZW50ZXIoKS5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImNsYXNzXCIsIFwiY19cIiArIGN1cnIubmFtZSkuYXR0cihcImN4XCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIHNjYWxlWChkLnRpbWUgKiAxMDAwKTtcbiAgICAgIH0pLmF0dHIoXCJjeVwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBzY2FsZVkoZC5yZWxhdGl2ZSArIDEwMCk7XG4gICAgICB9KS5hdHRyKFwiclwiLCAxKS5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHtzZWxmLnN0YXJ0WH0sJHtzZWxmLnN0YXJ0WX0pYCkuYXR0cihcImZpbGxcIiwgc2VsZi5jb2xvcnNbaW5kZXhdKS5hdHRyKFwic3Ryb2tlXCIsIHNlbGYuY29sb3JzW2luZGV4XSkubW92ZVRvRnJvbnQoKS5vbihcImNsaWNrXCIsIHNlbGVjdENsaWNrKS5vbihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiclwiLCA0KTtcbiAgICAgICAgc2VsZi5kaXYudHJhbnNpdGlvbigpLmR1cmF0aW9uKDIwMCkuc3R5bGUoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIikuc3R5bGUoXCJvcGFjaXR5XCIsIDAuOSk7XG5cbiAgICAgICAgc2VsZi5kaXYuaHRtbChjb2lubGlzdC5jdXJyZW5jaWVzW2luZGV4XS5uYW1lICsgXCI8YnIgXFw+XCIgKyBkLmNsb3NlICsgXCIgXCIgKyBjb2lubGlzdC5jb252ZXJ0VG8gKyBcIjxiciBcXD5cIiArIHRpbWVGb3JtYXQobmV3IERhdGUoZC50aW1lICogMTAwMCkpKS5zdHlsZShcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIikuc3R5bGUoXCJsZWZ0XCIsIChkMy5ldmVudC5wYWdlWCkgKyBcInB4XCIpLnN0eWxlKFwidG9wXCIsIChkMy5ldmVudC5wYWdlWSAtIDY1KSArIFwicHhcIik7XG4gICAgICB9KS5vbihcIm1vdXNlb3V0XCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJyXCIsIDEpO1xuICAgICAgICBzZWxmLmRpdi50cmFuc2l0aW9uKCkuZHVyYXRpb24oNTAwKS5zdHlsZShcIm9wYWNpdHlcIiwgMCkuc3R5bGUoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbn0iLCIvKiBqc2hpbnQgZXN2ZXJzaW9uOiA2ICovXG5cbi8vIFRPRE86IEFkZCBwcm9taXNlcyBldmVyeXdoZXJlXG4vLyBUT0RPOiBDbGVhbiB1bm5lY2Vzc2FyeSBqUXVlcnlcbi8vIFRPRE86IE11bHRpcGxlIHdpbmRvd3MgaW1wb3J0IHtDdXJyZW5jeUFQSX0gZnJvbSAnLi9hcGkuanMnO1xuaW1wb3J0IHtDdXJyZW5jeUFQSX0gZnJvbSAnLi9hcGkuanMnO1xuaW1wb3J0IHtDb2lubGlzdH0gZnJvbSAnLi9jb2lubGlzdC5qcyc7XG5pbXBvcnQge0N1cnJlbmN5fSBmcm9tICcuL2N1cnJlbmN5LmpzJztcbmltcG9ydCB7RHJhd0dyYXBofSBmcm9tICcuL2RyYXdHcmFwaC5qcyc7XG5cbmNsYXNzIE1haW4ge1xuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgaW5pdCgpIHtcbiAgICB0aGlzLmFwaSA9IG5ldyBDdXJyZW5jeUFQSSgpO1xuXG4gICAgdGhpcy5jb2luTGlzdCA9IG5ldyBDb2lubGlzdCh0aGlzLmFwaSk7XG5cbiAgICB0aGlzLmFwaS5nZXRDb2lucygpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhkYXRhLkRhdGEpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICQoXCIjY3VycmVuY2llc1wiKS5hcHBlbmQoYDxvcHRpb24gdmFsdWU9JyR7ZGF0YS5EYXRhW2tleXNbaV1dLkZ1bGxOYW1lfSc+PC9vcHRpb24+YCk7XG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuYWRkQ3VycmVuY2llcyh0aGlzLmxvYWRTdG9yYWdlKCkpO1xuICAgIHRoaXMuZXhjaGFuZ2VDdXJyZW5jeSgpO1xuICAgIHRoaXMudXBkYXRlQ3VycmVuY3lMaXN0KCk7XG4gICAgdGhpcy5zZWxlY3RlZFRpbWUoKTtcblxuICAgIHRoaXMuaW5pdEludGVyZmFjZSh0aGlzLmdyYXBoLCB0aGlzLmNvaW5MaXN0LCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblxuICB9XG5cbiAgYWRkQ3VycmVuY2llcyhjdXJyQXJyYXkpIHtcbiAgICAkKFwiI2N1cnJsaXN0XCIpLmVtcHR5KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjdXJyQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuYWRkQ3VycmVuY3lGcm9tU3RyaW5nKGN1cnJBcnJheVtpXSk7XG4gICAgfVxuICB9XG5cbiAgc2VsZWN0ZWRUaW1lKCkge1xuICAgIGxldCB0aW1lSW50ZXJ2YWwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInRpbWVJbnRlcnZhbFwiKTtcbiAgICBpZiAoIXRpbWVJbnRlcnZhbCkge1xuICAgICAgdGltZUludGVydmFsID0gXCJzaG93MTJIb3VyXCI7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInRpbWVJbnRlcnZhbFwiLCBcInNob3cxMkhvdXJcIik7XG4gICAgfVxuICB9XG5cbiAgZXhjaGFuZ2VDdXJyZW5jeSgpIHtcbiAgICBsZXQgZXhjaGFuZ2VDdXJyID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJleGNoYW5nZUN1cnJcIik7XG4gICAgaWYgKCFleGNoYW5nZUN1cnIpIHtcbiAgICAgIGV4Y2hhbmdlQ3VyciA9IFwic2hvdzEySG91clwiO1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJleGNoYW5nZUN1cnJcIiwgXCJVU0RcIik7XG4gICAgfVxuICAgICQoXCIjY2hvb3NlQ3VycmVuY3kgb3B0aW9uXCIpLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkKHRoaXMpLnRleHQoKSA9PSBleGNoYW5nZUN1cnI7XG4gICAgfSkucHJvcCgnc2VsZWN0ZWQnLCB0cnVlKTtcblxuICAgIHRoaXMuY29pbkxpc3QuY29udmVydFRvID0gJChcIiNjaG9vc2VDdXJyZW5jeVwiKS52YWwoKTtcbiAgfVxuICBhZGRDdXJyZW5jeUZyb21TdHJpbmcoc3RyKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBzdHJpbmdzID0gc3RyLm1hdGNoKC8oLiopXFwoKC4qKVxcKS4qLyk7XG4gICAgaWYgKHN0cmluZ3MubGVuZ3RoIDwgMykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgY3Vyck5hbWUgPSBzdHJpbmdzWzFdO1xuICAgIHZhciBuZXdDdXJyID0gc3RyaW5nc1syXS5yZXBsYWNlKFwiKlwiLCBcIlwiKTtcblxuICAgIGlmICgkKFwiI2N1cnJsaXN0PiNcIiArIG5ld0N1cnIpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgJChcIiNjdXJybGlzdFwiKS5hcHBlbmQoYDxzcGFuIGlkPVwiJHtuZXdDdXJyfVwiIGRhdGEtbG9uZ25hbWU9XCIke2N1cnJOYW1lfVwiIHRpdGxlPVwiJHtjdXJyTmFtZX0gLSBjbGljayB0byByZW1vdmVcIj4ke25ld0N1cnJ9PC9zcGFuPmApO1xuICAgICAgJChcIiNjdXJybGlzdD4jXCIgKyBuZXdDdXJyKS5jc3MoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIERyYXdHcmFwaC5nZW5lcmF0ZUNvbG9yKG5ld0N1cnIgKyBcIi9cIiArIG5ld0N1cnIpKTtcblxuICAgICAgJChcIiNjdXJybGlzdD4jXCIgKyBuZXdDdXJyKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgc2VsZi51cGRhdGVDdXJyZW5jeUxpc3QoKTtcbiAgICAgICAgc2VsZi5jb2luTGlzdC5zaG93TGFzdChzZWxmLmdyYXBoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAkKGAjY3Vycmxpc3Q+IyR7bmV3Q3Vycn1gKS5idXR0b24oKTtcbiAgfVxuXG4gIGxvYWRTdG9yYWdlKCkge1xuICAgIHZhciBzdG9yYWdlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJjdXJyZW5jaWVzXCIpO1xuICAgIGlmICghc3RvcmFnZSkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJjdXJyZW5jaWVzXCIsIFtcIkJpdGNvaW4gKEJUQylcIiwgXCJFdGhlcnVtIChFVEgpXCIsIFwiTGl0ZWNvaW4gKExUQylcIiwgXCJEaWdpdGFsQ2FzaCAoREFTSClcIiwgXCJEb2dlY29pbiAoRE9HRSlcIl0pO1xuICAgICAgcmV0dXJuIGluaXRpYWxDdXJyZW5jaWVzO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYXJyYXkgPSBzdG9yYWdlLnNwbGl0KFwiLFwiKTtcbiAgICAgIGZvciAodmFyIGkgaW4gYXJyYXkpIHtcbiAgICAgICAgaWYgKGFycmF5W2ldLm1hdGNoKC8oLiopXFwoKC4qKVxcKS4qLykubGVuZ3RoIDwgMykge1xuICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiY3VycmVuY2llc1wiLCBpbml0aWFsQ3VycmVuY2llcyk7XG4gICAgICAgICAgcmV0dXJuIGluaXRpYWxDdXJyZW5jaWVzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJyYXk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlQ3VycmVuY3lMaXN0KCkge1xuICAgIHZhciBjdXJyU3RyaW5nID0gXCJcIjtcbiAgICB2YXIgY3VycmVuY3lOYW1lcyA9IFtdO1xuICAgICQoXCIjY3Vycmxpc3Q+c3BhblwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgY3VyclN0cmluZyArPSB0aGlzLmlkICsgXCIsXCI7XG4gICAgICBjdXJyZW5jeU5hbWVzLnB1c2goJCh0aGlzKS5kYXRhKFwibG9uZ25hbWVcIikgKyBgKCR7dGhpcy5pZH0pYCk7XG4gICAgfSk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJjdXJyZW5jaWVzXCIsIGN1cnJlbmN5TmFtZXMpO1xuXG4gICAgY3VyclN0cmluZyA9IGN1cnJTdHJpbmcuc2xpY2UoMCwgLTEpO1xuICAgIHRoaXMuY29pbkxpc3QudXBncmFkZUN1cnJMaXN0KGN1cnJTdHJpbmcpO1xuICB9XG5cbiAgaW5pdEludGVyZmFjZShncmFwaCwgY29pbkxpc3QsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKGV2ZW50LnRhcmdldCAhPSB3aW5kb3cgJiYgJChldmVudC50YXJnZXQpLmZpbmQoXCIucmVuZGVyQ2FudmFzXCIpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VsZi5yZXNpemVXaW5kb3coZXZlbnQudGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgICQoXCIjY3VycmVuY3lcIikuY2hhbmdlKGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5hZGRDdXJyZW5jeUZyb21TdHJpbmcoJChcIiNjdXJyZW5jeVwiKS52YWwoKSk7XG4gICAgICBzZWxmLnVwZGF0ZUN1cnJlbmN5TGlzdCgpO1xuICAgICAgc2VsZi5jb2luTGlzdC5zaG93TGFzdChzZWxmLmdyYXBoKTtcbiAgICAgICQoXCIjY3VycmVuY3lcIikudmFsKFwiXCIpO1xuICAgIH0pO1xuXG4gICAgLyogZ2VuZXJhdGUgcmFkaW8gYnV0dG9ucyAqL1xuICAgIGZldGNoKFwibGliL3NldHRpbmdzL2J1dHRvbkxpc3QuanNvblwiKS50aGVuKGZ1bmN0aW9uKHJlc29sdmVkKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZWQuanNvbigpO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24oYnV0dG9uc0xpc3QpIHtcbiAgICAgLy8gY29uc29sZS5sb2coYnV0dG9uc0xpc3QpO1xuICAgICAgZm9yIChsZXQgaSBpbiBidXR0b25zTGlzdCkge1xuICAgICAgICAkKFwiI2NvbnRyb2xcIikuYXBwZW5kKGA8aW5wdXQgaWQ9XCIke2J1dHRvbnNMaXN0W2ldLmlkfVwiIHR5cGU9XCJyYWRpb1wiIG5hbWU9XCJpbnRlcnZhbFwiPjxsYWJlbCBmb3I9XCIke2J1dHRvbnNMaXN0W2ldLmlkfVwiIGNsYXNzPVwiaW50ZXJ2YWxMYWJlbFwiPiR7YnV0dG9uc0xpc3RbaV0uY2FwdGlvbn08L2xhYmVsPjxiciAvPmApO1xuICAgICAgICAoZnVuY3Rpb24oaSkge1xuICAgICAgICAgICQoXCIjXCIgKyBidXR0b25zTGlzdFtpXS5pZCkuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb2luTGlzdC5zaG93TGFzdChzZWxmLmdyYXBoLCBidXR0b25zTGlzdFtpXS50aW1lLCBidXR0b25zTGlzdFtpXS5jb3VudCk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInRpbWVJbnRlcnZhbFwiLCBidXR0b25zTGlzdFtpXS5pZCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pKGkpO1xuXG4gICAgICB9XG4gICAgICAkKFwiI2NvbnRyb2w+aW5wdXRcIikuY2hlY2tib3hyYWRpbyh7XG4gICAgICAgIGljb246IGZhbHNlLFxuICAgICAgICBjbGFzc2VzOiB7XG4gICAgICAgICAgXCJ1aS1jaGVja2JveHJhZGlvXCI6IFwiaGlnaGxpZ2h0XCJcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgICQoXCIjXCIgKyBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInRpbWVJbnRlcnZhbFwiKSkuY2xpY2soKTtcblxuICAgIH0pO1xuXG4gICAgJChcIiNjaG9vc2VDdXJyZW5jeVwiKS5jaGFuZ2UoZnVuY3Rpb24oKSB7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImV4Y2hhbmdlQ3VyclwiLCAkKFwiI2Nob29zZUN1cnJlbmN5XCIpLnZhbCgpKTtcbiAgICAgIGNvaW5MaXN0LmNvbnZlcnRUbyA9ICQoXCIjY2hvb3NlQ3VycmVuY3lcIikudmFsKCk7XG4gICAgICBjb2luTGlzdC5zaG93TGFzdChzZWxmLmdyYXBoKTtcbiAgICB9KTtcblxuICAgIGxldCBjdXJyZW5jeSA9ICQoXCIjY3VycmVuY3lXaW5kb3dcIikuZGlhbG9nKHtcbiAgICAgIGNsb3NlT25Fc2NhcGU6IGZhbHNlLFxuICAgICAgd2lkdGg6IDYwMCxcbiAgICAgIGhlaWdodDogMTQwLFxuICAgICAgbWluV2lkdGg6IDYwMCxcbiAgICAgIGRpYWxvZ0NsYXNzOiBcIm5vLWNsb3NlXCIsXG4gICAgICBwb3NpdGlvbjoge1xuICAgICAgICBteTogXCJsZWZ0IGJvdHRvbVwiLFxuICAgICAgICBhdDogXCJsZWZ0IHRvcFwiLFxuICAgICAgICBvZjogd2luZG93XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgd2luV2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAqIDAuOTtcbiAgICBsZXQgd2luSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICogMC43NztcbiAgICAkKFwiI3JlbmRlckNhbnZhc1wiKS5kaWFsb2coe1xuICAgICAgY2xvc2VPbkVzY2FwZTogZmFsc2UsXG4gICAgICB3aWR0aDogd2luV2lkdGgsXG4gICAgICBoZWlnaHQ6IHdpbkhlaWdodCxcbiAgICAgIGRpYWxvZ0NsYXNzOiBcIm5vLWNsb3NlXCIsXG4gICAgICBwb3NpdGlvbjoge1xuICAgICAgICBteTogXCJsZWZ0IHRvcFwiLFxuICAgICAgICBhdDogXCJsZWZ0IGJvdHRvbVwiLFxuICAgICAgICBvZjogY3VycmVuY3lcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBzdmcgPSBkMy5zZWxlY3QoXCIjcmVuZGVyQ2FudmFzXCIpLmFwcGVuZChcInN2ZzpzdmdcIikuYXR0cihcImlkXCIsIFwic3ZnXCIpO1xuICAgIGQzLnNlbGVjdChcInN2Z1wiKS5hdHRyKFwid2lkdGhcIiwgKHdpbldpZHRoIC0gMTUwKSkuYXR0cihcImhlaWdodFwiLCAod2luSGVpZ2h0IC0gNTApKTtcblxuICAgIHRoaXMuZ3JhcGggPSBuZXcgRHJhd0dyYXBoKHN2ZywgNTAsIDU1LCA1LCAxMDAsIDIwLCB3aW5XaWR0aCAtIDE1NSwgd2luSGVpZ2h0IC0gNTApO1xuXG4gICAgJChcIiNhZGRJbWdcIikuZGV0YWNoKCkuYXBwZW5kVG8oJChcIiNyZW5kZXJDYW52YXNcIikucGFyZW50KCkuZmluZChcIi51aS1kaWFsb2ctdGl0bGViYXI+LnVpLWRpYWxvZy10aXRsZVwiKSk7XG4gICAgJChcIiNhZGRJbWdcIikuYnV0dG9uKCk7XG5cbiAgICAkKFwiI2N1cnJlbmN5V2luZG93XCIpLmRpYWxvZygpO1xuICAgIC8vJChcIiNjb250cm9sXCIpLmRpYWxvZygpO1xuXG4gICAgJChcIiNhZGRJbWdcIikuY2xpY2soZnVuY3Rpb24oKSB7XG5cbiAgICAgIGxldCBzZXJpYWxpemVyID0gbmV3IFhNTFNlcmlhbGl6ZXIoKTtcblxuICAgICAgbGV0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICBhLmRvd25sb2FkID0gJ2NyeXB0b2NoYXJ0LnN2Zyc7XG4gICAgICBhLnR5cGUgPSAnaW1hZ2Uvc3ZnK3htbCc7XG4gICAgICB2YXIgYmxvYiA9IG5ldyBCbG9iKFsnPD94bWwgdmVyc2lvbj1cIjEuMFwiIHN0YW5kYWxvbmU9XCJub1wiPz5cXHJcXG4nICsgc2VyaWFsaXplci5zZXJpYWxpemVUb1N0cmluZygkKFwiI3N2Z1wiKVswXSldLCB7XCJ0eXBlXCI6IFwiaW1hZ2Uvc3ZnK3htbFwifSk7XG4gICAgICBhLmhyZWYgPSAod2luZG93LlVSTCB8fCB3ZWJraXRVUkwpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgIGEuY2xpY2soKTtcbiAgICAgICQoYSkuZGV0YWNoKCk7XG5cbiAgICB9KTtcbiAgfVxuXG4gIHJlc2l6ZVdpbmRvdyh0YXJnZXQpIHtcbiAgICBkMy5zZWxlY3QoXCJzdmdcIikuYXR0cihcIndpZHRoXCIsICgkKHRhcmdldCkud2lkdGgoKSAtIDExMCkpLmF0dHIoXCJoZWlnaHRcIiwgKCQodGFyZ2V0KS5oZWlnaHQoKSAtIDUwKSk7XG4gICAgdGhpcy5ncmFwaC5yZXNpemUoNTAsIDU1LCA1LCAxMDAsIDIwLCAkKHRhcmdldCkud2lkdGgoKSAtIDExMCwgJCh0YXJnZXQpLmhlaWdodCgpIC0gNTApO1xuXG4gIH1cbn1cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIHZhciBtYWluID0gbmV3IE1haW4oKTtcbiAgbWFpbi5pbml0KCk7XG59KTtcbiJdfQ==
