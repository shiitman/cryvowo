class Main {
    constructor() {
        this.initialCurrencies = ["Bitcoin (BTC)", "Etherum (ETH)", "Litecoin (LTC)", "DigitalCash (DASH)", "Dogecoin (DOGE)"];
    }

    init() {
        var raphaelWidth = window.innerWidth * 0.8;
        var raphaelHeight = window.innerHeight * 0.7;

        this.raph = Raphael(0, 0, raphaelWidth, raphaelHeight);
        this.graph = new DrawGraph(this.raph, 50, 50, 10, 40, 20, raphaelWidth - 150, raphaelHeight - 100);
        this.coinList = new Coinlist(this.graph);
        this.coinList.getCoins($("#currencies"));

        this.initInterface(this.graph, this.coinList, window.innerWidth, window.innerHeight);
        this.addCurrencies(this.loadCookie());

        this.updateCurrencyList();
        $("#control>#show12Hour").click();
    }

    addCurrencies(currArray) {
        $("#currlist").empty();
        for (let i = 0; i < currArray.length; i++) {
            this.addCurrencyFromString(currArray[i]);
        }
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
            $("#currlist>#" + newCurr).click(function () {
                this.remove();
                self.updateCurrencyList();
            });
        }
        $(`#currlist>#${newCurr}`).button();
    }

    loadCookie() {
        var cookie = Cookies.get("currencies");
        if (!Cookies.get("currencies")) {
            console.log(this.initialCurrencies)
            console.log(this.initialCurrencies.join(","))

            this.setCookie(this.initialCurrencies);
            return this.initialCurrencies;
        }
        else {
            var array = cookie.split(",");
            for (var i in array) {
                if (array[i].match(/(.*)\((.*)\).*/).length < 3) {
                    Cookies.remove("currencies");
                    loadCookie();
                    // something wrong with cookies, lets reset them
                }
            }
            return array;
        }
    }

    setCookie(array) {
        Cookies.set("currencies", array.join(","), { expires: 7 });
        //  console.log(Cookies.get("currencies"));
    }

    updateCurrencyList() {
        var currString = "";
        var currencyNames = [];
        $("#currlist>span").each(
            function () {
                currString += this.id + ",";
                currencyNames.push($(this).data("longname") + "(" + this.id + ")");
            }
        );
        this.setCookie(currencyNames);
        currString = currString.slice(0, -1);
        this.coinList.upgradeCurrList(currString);
        this.coinList.showLast();
    }

    initInterface(graph, coinList, width, height) {
        var self = this;
        /*$(window).resize(function () {
            initInterface(graph, coinList, window.innerWidth, window.innerHeight);
        });
        */
        $("#currency").change(function () {
            self.addCurrencyFromString($("#currency").val());
            self.updateCurrencyList();
            $("#currency").val("");
        });
        $("#showHour").click(function () {
            coinList.showLast("minute", 60);
        });
        $("#show12Hour").click(function () {
            coinList.showLast("minute", 720);
        });
        $("#show24Hour").click(function () {
            coinList.showLast("minute", 60 * 24);
        });
        $("#showWeek").click(function () {
            coinList.showLast("hour", 168);
        });
        $("#showMonth").click(function () {
            coinList.showLast("hour", 720);
        });
        $("#show3Month").click(function () {
            coinList.showLast("day", 90);
        });
        $("#showYear").click(function () {
            coinList.showLast("day", 365);
        });
        $("#chooseCurrency").change(function () {
            coinList.convertTo = $("#chooseCurrency").val();
            coinList.showLast();
        });

        /*
        $("#showCanvas").click(function() {
            graph.canvas.showCanvas();
            $("#showCanvas").hide();
            $("#hideCanvas").show();
        });

        $("#hideCanvas").click(function() {
            graph.canvas.hideCanvas();
            $("#hideCanvas").hide();
            $("#showCanvas").show();
        });

        $("#line").click(function() {
            graph.canvas.selectLine();
        });
        $("#curve").click(function() {
            graph.canvas.selectCurve();
        });
        $("#clearCanvas").click(function() {
            graph.canvas.clearCanvas();
        });
        */

        $("#control>input").checkboxradio({
            icon: false, classes: { "ui-checkboxradio": "highlight" }
        });

        let control = $("#control").dialog({
            width: 80, height: 350, dialogClass: "no-close",
            position: { my: "left top", at: "left top", of: window }
        });

        let currency = $("#currencyWindow").dialog({
            width: 600, height: 140, minWidth: 600, dialogClass: "no-close",
            position: { my: "left bottom", at: "right top", of: control }
        });
        $("svg").appendTo("#raphaelCanvas");

        let raphWin = $("#raphaelCanvas").dialog({
            width: width * 0.8, height: height * 0.77, dialogClass: "no-close",
            position: { my: "left top", at: "left bottom", of: currency },
        });

        $("#addImg").detach().appendTo($("#raphaelCanvas").parent().children(".ui-dialog-titlebar"));
        $("#addImg").button();

        $("#currencyWindow").dialog();
        $("#control").dialog();

        $("#addImg").click(function () {
            var svgText = graph.paper.toSVG();
            var a = document.createElement('a');
            a.download = 'cryptochart.svg';
            a.type = 'image/svg+xml';
            var blob = new Blob([svgText], { "type": "image/svg+xml" });
            a.href = (window.URL || webkitURL).createObjectURL(blob);
            a.click();
        });
    }
}

$(document).ready(function () {
    var main = new Main();
    main.init();
});