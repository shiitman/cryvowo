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
                console.log("test");
                self.myCurr.splice(index, 1);
            }
        });
        console.log(this.myCurr);
    }

    getCoins(datalist) {
        $.ajax("https://min-api.cryptocompare.com/data/all/coinlist").done(function (data) {
            var keys = Object.keys(data.Data);
            console.log(data.Data);
            for (var i = 0; i < keys.length; i++) {
                //   console.log(keys[i]);
                datalist.append(`<option value='${data.Data[keys[i]].FullName}'></option>`);
            }
        });
    }

    showLast(hourOrMin = null, valuesCount = null) {
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
        console.log(this.valuesCount, hourOrMin, valuesCount);
        this.counter = 0;
        this.graph.resetAll();

        for (var i in this.myCurr) {
            console.log(i);
            var curr = new Currency(this.myCurr[i], this.convertTo);
            curr.getHistoricLast(this, i);
            console.log(this.currencies);
            this.currencies.push(curr);
        }
    }

    increaseCounter() {
        console.log("COUNTER");
        console.log(this.hourOrMin, this.valuesCount);
        this.counter++;
        //            console.log(this.counter);
        if (this.counter >= this.myCurr.length) {
            //       console.log("TEST");
            this.graph.drawLines(this.hourOrMin, this.valuesCount);
            this.counter = 0;
            this.isLoading = false;
        }
    }
}