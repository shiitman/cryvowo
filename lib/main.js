"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jshint esversion: 6 */

var Main = function () {
  function Main() {
    _classCallCheck(this, Main);
  }

  _createClass(Main, [{
    key: "init",
    value: function init() {
      this.api = new CurrencyAPI();

      this.coinList = new Coinlist(this.api);
      this.api.getCoins().then(function (data) {
        console.log(data);
        var keys = Object.keys(data.Data);
        for (var i = 0; i < keys.length; i++) {
          console.log(keys[i]);
          $("#currencies").append("<option value='" + data.Data[keys[i]].FullName + "'></option>");
        }
      });

      this.initInterface(this.graph, this.coinList, window.innerWidth, window.innerHeight);
      this.addCurrencies(this.loadStorage());

      this.exchangeCurrency();
      this.updateCurrencyList();

      this.selectedTime();
    }
  }, {
    key: "addCurrencies",
    value: function addCurrencies(currArray) {
      $("#currlist").empty();
      for (var i = 0; i < currArray.length; i++) {
        this.addCurrencyFromString(currArray[i]);
      }
    }
  }, {
    key: "selectedTime",
    value: function selectedTime() {
      var timeInterval = localStorage.getItem("timeInterval");
      if (!timeInterval) {
        timeInterval = "show12Hour";
        localStorage.setItem("timeInterval", "show12Hour");
      }
      $("#" + timeInterval).click();
    }
  }, {
    key: "exchangeCurrency",
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
    key: "addCurrencyFromString",
    value: function addCurrencyFromString(str) {
      var self = this;
      var strings = str.match(/(.*)\((.*)\).*/);
      if (strings.length < 3) {
        return;
      }
      var currName = strings[1];
      var newCurr = strings[2].replace("*", "");

      if ($("#currlist>#" + newCurr).length === 0) {
        $("#currlist").append("<span id=\"" + newCurr + "\" data-longname=\"" + currName + "\" title=\"" + currName + " - click to remove\">" + newCurr + "</span>");
        $("#currlist>#" + newCurr).css("background-color", this.graph.generateColor(newCurr + "/" + newCurr));

        $("#currlist>#" + newCurr).click(function () {
          this.remove();
          self.updateCurrencyList();
          self.coinList.showLast(self.graph);
        });
      }
      $("#currlist>#" + newCurr).button();
    }
  }, {
    key: "loadStorage",
    value: function loadStorage() {
      var storage = localStorage.getItem("currencies");
      if (!storage) {
        localStorage.setItem("currencies", initialCurrencies);
        return initialCurrencies;
      } else {
        var array = storage.split(",");
        for (var i in array) {
          if (array[i].match(/(.*)\((.*)\).*/).length < 3) {
            localStorage.setItem("currencies", initialCurrencies);
            return initialCurrencies;
            // something wrong in storage
          }
        }
        return array;
      }
    }
  }, {
    key: "updateCurrencyList",
    value: function updateCurrencyList() {
      var currString = "";
      var currencyNames = [];
      $("#currlist>span").each(function () {
        currString += this.id + ",";
        currencyNames.push($(this).data("longname") + ("(" + this.id + ")"));
      });
      localStorage.setItem("currencies", currencyNames);

      currString = currString.slice(0, -1);
      this.coinList.upgradeCurrList(currString);
    }
  }, {
    key: "initInterface",
    value: function initInterface(graph, coinList, width, height) {
      var self = this;
      console.log($);
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
      for (var i in buttonsList) {
        $("#control").append("<input id=\"" + buttonsList[i].id + "\" type=\"radio\" name=\"interval\"><label for=\"" + buttonsList[i].id + "\" class=\"intervalLabel\">" + buttonsList[i].caption + "</label><br />");
        (function (i) {
          $("#" + buttonsList[i].id).click(function () {
            coinList.showLast(self.graph, buttonsList[i].time, buttonsList[i].count);
            localStorage.setItem("timeInterval", buttonsList[i].id);
          });
        })(i);
      }

      $("#chooseCurrency").change(function () {
        localStorage.setItem("exchangeCurr", $("#chooseCurrency").val());
        coinList.convertTo = $("#chooseCurrency").val();
        coinList.showLast(self.graph);
      });

      $("#control>input").checkboxradio({
        icon: false,
        classes: {
          "ui-checkboxradio": "highlight"
        }
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

      this.graph = new DrawGraph(svg, 50, 55, 5, 100, 20, winWidth - 155, winHeight - 50);

      $("#addImg").detach().appendTo($("#renderCanvas").parent().find(".ui-dialog-titlebar>.ui-dialog-title"));
      $("#addImg").button();

      $("#currencyWindow").dialog();
      //$("#control").dialog();

      $("#addImg").click(function () {

        var serializer = new XMLSerializer();

        var a = document.createElement('a');
        a.download = 'cryptochart.svg';
        a.type = 'image/svg+xml';
        var blob = new Blob(['<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString($("#svg")[0])], {
          "type": "image/svg+xml"
        });
        a.href = (window.URL || webkitURL).createObjectURL(blob);
        a.click();
        $(a).detach();
      });
    }
  }, {
    key: "resizeWindow",
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
//# sourceMappingURL=../map/main.js.map