var initialCurrencies = ["Etherum (ETH)", "Bitcoin (BTC)", "DigitalCash (DASH)", "Dogecoin (DOGE)"];
var graph;
var coinList;

function init() {
    var raphaelWidth = window.innerWidth * 0.8;
    var raphaelHeight = window.innerHeight * 0.7;

    var raph = Raphael(0, 0, raphaelWidth, raphaelHeight);
    //  graph = new DrawGraph(raph, 50, 50, 10, 40, 20, window.innerWidth * 0.8 - 150, window.innerHeight * 0.7 - 100);
    graph = new DrawGraph(raph, 50, 50, 10, 40, 20, raphaelWidth, raphaelHeight);
    // graph.resize((1920 - window.innerWidth * 0.8) / 2, -(1024 - window.innerHeight * 0.7) / 2, window.innerWidth * 0.8, window.innerHeight * 0.7);
    // graph.resize(0, 0, 2 * 2000 - window.innerWidth * 0.8, 2 * 1500 - (window.innerHeight * 0.8));
    // graph.resize(0, 0, 1920, 1024);
    coinList = new Coinlist(graph);
    coinList.getCoins($("#currencies"));

    initInterface(graph, coinList, window.innerWidth, window.innerHeight);
    addCurrencies(initialCurrencies);
    console.log(coinList);

    updateCurrencyList();
    $("#control>#show12Hour").click();
}

function updateCurrencyList() {
    var currs = "";
    $("#currlist>span").each(
        function () {
            currs += this.id + ",";
        }
    );
    currs = currs.slice(0, -1);
    coinList.upgradeCurrList(currs);
    coinList.showLast();
}

function addCurrencies(currArray) {
    for (var i = 0; i < currArray.length; i++) {
        addCurrencyFromString(currArray[i]);
    }
}

$(document).ready(function () {
    init();
});