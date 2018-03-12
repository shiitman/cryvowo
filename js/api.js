class CurrencyAPI{
  constructor(){

  }
  getHistorical(hoursOrMinutes, name, conversion, valuesCount, processFunction, cancelFunction, counter=0){
    var self=this;
    $.ajax("https://min-api.cryptocompare.com/data/histo" + hoursOrMinutes + "?fsym=" + name + "&tsym=" + conversion + "&limit=" + valuesCount).done(function(data) {
      if (data.Response == "Error") {
        if (counter < 5) {
          setTimeout(
            function() {
              console.log(self.name, counter + " try");
              self.getHistorical(hoursOrMinutes, name, conversion, valuesCount, processFunction, cancelFunction, counter+1);
            }, 1500
          );
        }else {
          cancelFunction();
        }
      } else {
        processFunction(data);
      }
    });
  }


}
