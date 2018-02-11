class Currency{
	constructor(name, conv){
		this.name=name;
		this.conversion=conv;
		this.index=0;
		this.counter=0;
	}
	
	getHistoricLast(coinlist, ind){
		var self=this;
		this.index=ind;

		var drawObj=coinlist.graph;
		var hoursOrMinutes=coinlist.hourOrMin;

		this.values=[];
		if (this.conversion!=this.name){
				$.ajax("https://min-api.cryptocompare.com/data/histo"+hoursOrMinutes+"?fsym="+self.name+"&tsym="+this.conversion+"&limit="+coinlist.valuesCount).done(function (data){
					self.saveGraph(data, drawObj);
					if (data.Response=="Error"){
						if (self.counter<5){
							setTimeout(
								function(){
									console.log(self.counter, self.name)
									self.getHistoricLast(coinlist, ind);
									self.counter++;
								}, 1500
							);							
						}
						else{
							coinlist.increaseCounter();
						}
					}
					else{
						coinlist.increaseCounter();
					}
				//	console.log(data);
			});
		}
		else{
			drawObj.addGraph(self);
			coinlist.increaseCounter();
		}
	}	

	saveGraph(data, drawObj){
		var self=this;
		if (data.Response=="Error"){
			console.log(this.name+" Error");
			self.values=[];
			drawObj.addGraph(self);
			return;
		}
		var timeDiff=(data.TimeTo-data.TimeFrom);
	//	console.log(data.Data[0]);
		var max=data.Data[0].close;
		var min=data.Data[0].close;
		for (var i in data.Data){
			if (max<data.Data[i].close){
				max=data.Data[i].close;
			}
			if (min>data.Data[i].close){
				min=data.Data[i].close;
			}
		}
		var mid=(max+min)/2;

		self.values["max"]=max;
		self.values["min"]=min;
		self.values["mid"]=mid;	
		
		self.values["data"]=[];

		for (var i in data.Data){
			var rel=(data.Data[i].close-mid)/mid*100;
			self.values["data"].push({value:data.Data[i].close, relative:rel, time:data.Data[i].time});
		}
console.log(self.values["data"]);
	//	console.log("AddLine", self.name);
		drawObj.addGraph(self);
	
	}

}