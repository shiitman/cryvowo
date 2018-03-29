/* jshint esversion: 6 */

export class CurrencyAPI {
  constructor() {}
  getHistorical(hoursOrMinutes, name, conversion, valuesCount, counter = 0) {
    var self = this;
    if (name == conversion) {
      return Promise.resolve(self.always1(hoursOrMinutes, valuesCount));
    }
    return fetch("https://min-api.cryptocompare.com/data/histo" + hoursOrMinutes + "?fsym=" + name + "&tsym=" + conversion + "&limit=" + valuesCount).then(function(response) {
      return response.json();
    }).then(function(data) {
      if (data.Response == "Error") {
        if (counter < 5) {
          return self.getHistorical(hoursOrMinutes, name, conversion, valuesCount, counter + 1);
        }
      } else {
        return (data);
      }
    });
  }

  getCurrent() {}

  getCoins() {
    return fetch("https://min-api.cryptocompare.com/data/all/coinlist").then(function(response) {
      return response.json();
    });
  }

  always1(hoursOrMinutes, valuesCount) {
    let interval = 60;
    if (hoursOrMinutes == "hour") {
      interval = 3600;
    }
    if (hoursOrMinutes == "day") {
      interval = 3600 * 24;
    }
    let currentTime = Math.floor(Date.now() / 1000);
    currentTime -= currentTime % interval;
    let timeFrom = currentTime - interval * valuesCount;

    var data = {
      TimeTo: currentTime,
      TimeFrom: timeFrom,
      Data: [
        {
          close: 1,
          time: timeFrom
        }, {
          close: 1,
          time: currentTime
        }
      ]
    };
    return data;
  }
}

export default {CurrencyAPI};
