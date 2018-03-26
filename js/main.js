/*jshint esversion: 6 */

class Main {
  constructor() {}

  init() {
    var winWidth = window.innerWidth * 0.8 - 110;
    var winHeight = window.innerHeight * 0.7 - 30;

    var svg = d3.select("#renderCanvas").append("svg:svg").attr("id", "svg");
    d3.select("svg").attr("width", (winWidth))
      .attr("height", (winHeight));

    this.graph = new DrawGraph(svg, 50, 45, 5, 100, 20, winWidth - 40, winHeight - 100);
    this.coinList = new Coinlist(this.graph);
    this.coinList.getCoins($("#currencies"));

    this.initInterface(this.graph, this.coinList, window.innerWidth, window.innerHeight);
    this.addCurrencies(this.loadStorage());

    this.exchangeCurrency();
    this.updateCurrencyList();

    this.selectedTime();

  }

  addCurrencies(currArray) {
    $("#currlist").empty();
    for (let i = 0; i < currArray.length; i++) {
      this.addCurrencyFromString(currArray[i]);
    }
  }
  selectedTime() {
    let timeInterval = localStorage.getItem("timeInterval");
    if (!timeInterval) {
      timeInterval = "show12Hour";
      localStorage.setItem("timeInterval", "show12Hour");
    }
    $("#" + timeInterval).click();

  }

  exchangeCurrency() {
    let exchangeCurr = localStorage.getItem("exchangeCurr");
    if (!exchangeCurr) {
      exchangeCurr = "show12Hour";
      localStorage.setItem("exchangeCurr", "USD");
    }
    $("#chooseCurrency option").filter(function() {
      return $(this).text() == exchangeCurr;
    }).prop('selected', true);

    this.coinList.convertTo = $("#chooseCurrency").val();
  }
  addCurrencyFromString(str) {
    var self = this;
    var strings = str.match(/(.*)\((.*)\).*/);
    if (strings.length < 3) {
      return;
    }
    var currName = strings[1];
    var newCurr = strings[2].replace("*", "");

    if ($("#currlist>#" + newCurr).length === 0) {
      $("#currlist").append(`<span id="${newCurr}" data-longname="${currName}" title="${currName} - click to remove">${newCurr}</span>`);
      $("#currlist>#" + newCurr).click(function() {
        this.remove();
        self.updateCurrencyList();
        self.coinList.showLast();
      });
    }
    $(`#currlist>#${newCurr}`).button();
  }

  loadStorage() {
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
          // something wrong in storage, lets reset it
        }
      }
      return array;
    }
  }


  updateCurrencyList() {
    var currString = "";
    var currencyNames = [];
    $("#currlist>span").each(
      function() {
        currString += this.id + ",";
        currencyNames.push($(this).data("longname") + `(${this.id})`);
      }
    );
    localStorage.setItem("currencies", currencyNames);

    currString = currString.slice(0, -1);
    this.coinList.upgradeCurrList(currString);
  }

  initInterface(graph, coinList, width, height) {
    var self = this;
    /*$(window).resize(function () {
        initInterface(graph, coinList, window.innerWidth, window.innerHeight);
    });
    */
    $("#currency").change(function() {
      self.addCurrencyFromString($("#currency").val());
      self.updateCurrencyList();
      self.coinList.showLast();
      $("#currency").val("");
    });

    /*generate radio buttons*/
    for (let i in buttonsList) {
      $("#control").append(`<input id="${buttonsList[i].id}" type="radio" name="interval"><label for="${buttonsList[i].id}" class="intervalLabel">${buttonsList[i].caption}</label><br />`);
      (function(i) {
        $("#" + buttonsList[i].id).click(function() {
          coinList.showLast(buttonsList[i].time, buttonsList[i].count);
          localStorage.setItem("timeInterval", buttonsList[i].id);
        });
      })(i);
    }

    $("#chooseCurrency").change(function() {
      localStorage.setItem("exchangeCurr", $("#chooseCurrency").val());
      coinList.convertTo = $("#chooseCurrency").val();
      coinList.showLast();
    });


    $("#control>input").checkboxradio({
      icon: false,
      classes: {
        "ui-checkboxradio": "highlight"
      }
    });

    let currency = $("#currencyWindow").dialog({
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

    $("#renderCanvas").dialog({
      closeOnEscape: false,
      width: width * 0.8,
      height: height * 0.77,
      dialogClass: "no-close",
      position: {
        my: "left top",
        at: "left bottom",
        of: currency
      },
    });

    $("#addImg").detach().appendTo($("#renderCanvas").parent().children(".ui-dialog-titlebar"));
    $("#addImg").button();

    $("#currencyWindow").dialog();
    //$("#control").dialog();

    $("#addImg").click(function() {

      let serializer = new XMLSerializer();

      let a = document.createElement('a');
      a.download = 'cryptochart.svg';
      a.type = 'image/svg+xml';
      var blob = new Blob(['<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString($("#svg")[0])], {
        "type": "image/svg+xml"
      });
      a.href = (window.URL || webkitURL).createObjectURL(blob);
      a.click();
      a.detach();

    });
  }
}

$(document).ready(function() {
  var main = new Main();
  main.init();
});