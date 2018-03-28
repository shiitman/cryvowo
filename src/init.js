/*jshint esversion: 6 */

/*
temporary solution iz govna i palok, will be replaced with proper templates
*/

var buttonsList = [{
    id: "showHour",
    time: "minute",
    count: 60,
    caption: "Last hour"
  },
  {
    id: "show12Hour",
    time: "minute",
    count: 720,
    caption: "12 Hours"
  },
  {
    id: "show24Hour",
    time: "minute",
    count: 1440,
    caption: "24 Hours"
  }, 
  {
    id: "showWeek",
    time: "hour",
    count: 168,
    caption: "7 Days"
  },
  {
    id: "showMonth",
    time: "hour",
    count: 720,
    caption: "30 Days"
  },
  {
    id: "show3Month",
    time: "day",
    count: 90,
    caption: "90 Days"
  },
  {
    id: "showYear",
    time: "day",
    count: 365,
    caption: "Year"
  }
];

var initialCurrencies = ["Bitcoin (BTC)", "Etherum (ETH)", "Litecoin (LTC)", "DigitalCash (DASH)", "Dogecoin (DOGE)"];
