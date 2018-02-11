//["BTC","ETH","ZRX", "REP", "BNT", "BAT", "BCH", "BTG", "CVC", "DASH", "DCR", "EDG", "EOS", "LTC", "ETC","FUN", "GNO", "GNT", "RLC"];
class Coinlist{
    constructor(){
        this.myCurr=["BTC"];
        this.raph=Raphael(50, 80, 1200, 800);
        this.graph=new DrawGraph(this.raph);
        this.currencies=[];
        this.hourOrMin="minute";
        this.counter=0;
        this.convertTo="USD";
        this.valuesCount=720;
   }

   upgradeCurrList(str){
       var self=this;
      this.myCurr=str.split(",");
      this.myCurr.map(function(val, index){
          if (val==""){
              console.log("test");
              self.myCurr.splice(index, 1);
          }
      });
        console.log(this.myCurr);
   }

    getCoins(datalist){
      	$.ajax("https://min-api.cryptocompare.com/data/all/coinlist").done(function (data){
            var keys=Object.keys(data.Data);
            for (var i=0; i<keys.length;i++){
             //   console.log(keys[i]);
                datalist.append(`<option value='${keys[i]}'></option>`)
            }
		});  
    }

    showLast(hourOrMin=null, valuesCount=null){
        if (hourOrMin!=null){
            this.hourOrMin=hourOrMin;
        }
        if (valuesCount!=null){
            this.valuesCount=valuesCount;
        }
        console.log(this.valuesCount, hourOrMin, valuesCount);
        this.counter=0;
        this.graph.valuesShow=this.valuesCount;
        this.graph.resetAll();
        this.graph.initColors(this.myCurr.length);
        this.graph.showGraph();
        for (var i in this.myCurr){
                    console.log(i);
            var curr=new Currency(this.myCurr[i], this.convertTo);
            curr.getHistoricLast(this, i);
            this.currencies.push(curr)
        }
    }

    increaseCounter(){
        this.counter++;
 	    //            console.log(this.counter);
        if (this.counter>=this.myCurr.length){
     //       console.log("TEST");
			 this.graph.drawLines(this.hourOrMin);
             this.counter=0;
        }
    }
}