/*jshint esversion: 6 */

class CurrencyAPI {
  constructor() {}
  getHistorical(hoursOrMinutes, name, conversion, valuesCount, processFunction, cancelFunction, counter = 0) {
    var self = this;
    if (name == conversion) {
      let data = this.always1(hoursOrMinutes, valuesCount);
      processFunction(data);
      return;
    }
    $.ajax("https://min-api.cryptocompare.com/data/histo" + hoursOrMinutes + "?fsym=" + name + "&tsym=" + conversion + "&limit=" + valuesCount).done(function(data) {
      if (data.Response == "Error") {
        if (counter < 5) {
          setTimeout(
            function() {
              console.log(self.name, counter + " try");
              self.getHistorical(hoursOrMinutes, name, conversion, valuesCount, processFunction, cancelFunction, counter + 1);
            }, 1500
          );
        } else {
          cancelFunction();
        }
      } else {
        processFunction(data);
      }
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
      Data: [{
          close: 1,
          time: timeFrom
        },
        {
          close: 1,
          time: currentTime
        }
      ]
    };
    return data;

  }



}