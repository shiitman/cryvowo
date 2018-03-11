//["BTC","ETH","ZRX", "REP", "BNT", "BAT", "BCH", "BTG", "CVC", "DASH", "DCR", "EDG", "EOS", "LTC", "ETC","FUN", "GNO", "GNT", "RLC"];
class Coinlist {
    constructor(graph) {
        this.myCurr = [];
        this.graph = graph;
        this.currencies = [];
        this.hourOrMin = "minute";
        this.counter = 0;
        this.convertTo = "USD";
        this.valuesCount = 720;
        this.isLoading = false;
    }

    upgradeCurrList(str) {
        var self = this;
        this.myCurr = str.split(",");
        this.myCurr.map(function (val, index) {
            if (val === "") {
                self.myCurr.splice(index, 1);
            }
        });
    }

    getCoins(datalist) {
        $.ajax("https://min-api.cryptocompare.com/data/all/coinlist").done(function (data) {
            var keys = Object.keys(data.Data);
            for (var i = 0; i < keys.length; i++) {
                //   console.log(keys[i]);
                datalist.append(`<option value='${data.Data[keys[i]].FullName}'></option>`);
            }
        });
    }

    showLast(hourOrMin = null, valuesCount = null) {
        var self = this;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        if (!this.isLoading) {
            this.isLoading = true;
        }
        else {
            return;
        }
        if (hourOrMin !== null) {
            this.hourOrMin = hourOrMin;
        }
        if (valuesCount !== null) {
            this.valuesCount = valuesCount;
        }

        this.counter = 0;
        this.graph.resetPaper();

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
            self.showLast();
          }, timeout);
        }
    }

    increaseCounter() {
        this.counter++;
        //            console.log(this.counter);
        if (this.counter >= this.myCurr.length) {
            //       console.log("TEST");
            this.graph.drawGraph(this.hourOrMin, this.valuesCount);
            this.counter = 0;
            this.isLoading = false;
        }
    }
}
