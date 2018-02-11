class DrawGraph{
	constructor(raphael){
		this.startX=50;
		this.startY=50;

		this.buttonY=10;
		this.buttonWidth=40;
		this.buttonHeight=20;

		this.height=500;
		this.width=1000;

		this.valuesShow=720;
		this.paper = raphael;
		this.currencies=[];

		this.resetAll();
		this.showGraph();
	}

	resetAll(){
		this.currencies=[];
		this.maxVal=0;
		this.paper.clear();
		this.line=[];
		this.texts=[];
		this.colors=[];
		this.buttons=[];
		this.captions=[];
		this.text=this.paper.text(20, 10, "").attr("font-weight", "bold");
		this.textBackground=this.paper.rect(20,20,50,50).attr({"opacity":0.7, "fill":"#ffffff"});
		this.textBackground.hide();
	}

	initColors(size){

		this.colors[0]="#000000";
		for (var i=1; i<size+1; i++) {
			var red   = this.sin_to_hex(i, 0 * Math.PI * 2/3, size); // 0   deg
			var blue  = this.sin_to_hex(i, 1 * Math.PI * 2/3, size); // 120 deg
			var green = this.sin_to_hex(i, 2 * Math.PI * 2/3, size); // 240 deg

			 this.colors[i] = "#"+ red + green + blue;
		}
	}

	showGraph(){
		this.coords=this.paper.path("M"+this.startX+" "+this.startY+"L"+this.startX+" "+(this.height+this.startY)+"L"+(this.width+this.startX)+" "+(this.height+this.startY));
	}

	showTimestamps(hourOrMinute){
		var timeStampsCount=20;
		
	//	console.log(hourOrMinute);
		var currentDate= Date.now();
		var timeStep =60*1000*((hourOrMinute=="hour")?60:1);

		if (hourOrMinute=="day")
			timeStep=timeStep*60*24;
//		console.log(curr);
		this.timestamps=[];
		for (var i=timeStampsCount; i>0; i--){
			var timestamp=this.paper.text((this.width/timeStampsCount)*i+this.startX, this.height+this.startY+15, this.formatDate(currentDate-(timeStampsCount-i)*timeStep*this.valuesShow/timeStampsCount));
			this.paper.path("M"+((this.width/timeStampsCount)*i+this.startX)+" "+(this.height+this.startY-10)+"L"+((this.width/timeStampsCount)*i+this.startX)+" "+(this.height+this.startY+10))
		}
	}

	addGraph(curr){
		var self=this;
		this.line[curr.name]=[];
		this.currencies[curr.name]=curr;
		for (var i in this.currencies[curr.name].values["data"]){
			if (this.maxVal<Math.abs(this.currencies[curr.name].values["data"][i].relative)){
				this.maxVal=Math.abs(this.currencies[curr.name].values["data"][i].relative);
			} 
		}
	}
	

	drawLines(){
	//	console.log("MaxValue"+this.maxVal);
		var step=(this.width)/this.valuesShow;	
		var diff=this.height/(this.maxVal*2);
		for (var curname in this.currencies)
		{
			var colorIndex=this.currencies[curname].index;

			console.log(curname);
			var array=this.currencies[curname].values;
			var	active=true;

			if (this.currencies[curname].conversion!=curname){
				if (array.length>0 || array.hasOwnProperty("data")>0){
					for (var i=0; i<this.valuesShow-1; i++){
						var pathStr = "M"+Math.round(step*i+this.startX)+" "+Math.round(this.height/2-diff*array["data"][i].relative+this.startY );
						pathStr+="L"+Math.round(step*(i+1)+this.startX)+" "+Math.round( this.height/2-diff*array["data"][i+1].relative+this.startY );	
						
						var newPath=this.paper.path(pathStr);
						
						newPath.X=Math.round(step*i+this.startX);
						newPath.Y=Math.round(this.height/2-diff*array["data"][i].relative+this.startY);
						newPath.VAL=array["data"][i].value;
						newPath.INDEX=i;
						newPath.TIME=this.formatDate(array["data"][i].time*1000); 
						newPath.COLOR=this.colors[colorIndex];
						newPath.CUR=curname;
						this.createHover(newPath);
						
						newPath.attr("stroke", this.colors[colorIndex]).attr("stroke-width", 2);				

					//	console.log(curname);
						if(!this.line[curname])
							console.log(curname, "error");

						this.line[curname].push(newPath);
					}
				}
				else{
					active=false;
				}
			}
			else{
					var pathStr = "M"+this.startX+" "+Math.round(this.height/2+this.startY );
					pathStr+="L"+(this.startX+this.width)+" "+Math.round(this.height/2+this.startY );
					var newPath=this.paper.path(pathStr);
					newPath.X=self.startX+self.width/2;
					newPath.Y=self.startY;
					newPath.VAL=1;
					newPath.INDEX=0;

					newPath.TIME=""; 
					newPath.COLOR=this.colors[colorIndex];
					newPath.CUR=curname;
					newPath.attr("stroke", this.colors[colorIndex]).attr("stroke-width", 2);
					this.createHover(newPath);

					this.line[curname].push(newPath);

			}
			this.addButton(this.currencies[curname], colorIndex, active);
		}
	}

	formatDate(time){
		var date = new Date(time)

		var dates=[];
		dates[0]=(date.getMonth()+1).toString();
		dates[1]=(date.getDate()).toString();
		dates[2]=(date.getHours()).toString();
		dates[3]=(date.getMinutes()).toString();
		dates[4]=(date.getYear()-100).toString();
			
		for (var d in dates){
			if (dates[d].length<2)
				dates[d]="0"+dates[d];
		}
		return (dates[0]+"."+dates[1]+"."+dates[4]+"\n"+dates[2]+":"+dates[3]);
	}

	createHover(newPath){
		var self=this;

		newPath.hover(
			function(){
				if (self.line[this.CUR].length>1){
				
					self.vertical=self.paper.path("M"+(this.X)+" "+self.startY+"L"+(this.X)+" "+(self.startY+self.height)).attr('stroke-dasharray',"-..");
					self.horizontal=self.paper.path("M"+(self.startX)+" "+this.Y+"L"+(self.startX+self.width)+" "+(this.Y)).attr('stroke-dasharray',"-..");

					self.selectGraph(this.CUR, 3, true)
					this.circle= self.paper.circle (this.X, this.Y, 6).attr("fill", this.COLOR);					
					this.toFront();
					self.showTextValue(this);	
				}
				else{
					self.selectGraph(this.CUR, 3, true)
				}
			},
			function(){
				if (self.line[this.CUR].length>1){
					this.attr("stroke", this.COLOR);	
					self.selectGraph(this.CUR, 2, false)
					self.vertical.remove();
					self.horizontal.remove();
					self.textBackground.hide();
					self.text.hide();
					this.circle.remove();					
				}
				else{
					self.selectGraph(this.CUR, 2, false)
				
				}				
			}
		);

		newPath.click(
			function(){

			}
		);

	}
	showTextValue(path){
		this.textBackground.show();
		this.textBackground.attr({"x":path.X-25, "y":path.Y-75});	
		this.textBackground.toFront();
		this.text.attr("text", path.CUR+"\n"+path.VAL+"\n"+path.TIME);		
		this.text.attr({"x":path.X, "y":path.Y-50});		
		this.text.show();				
		this.text.toFront();
	}

	addButton(curr, colorIndex, active){
		var self=this;
		this.captions[curr.name]=this.paper.text(this.startX+this.buttonWidth*colorIndex+this.buttonWidth/2, this.buttonY+this.buttonHeight/2, curr.name).attr("fill", "#050505");;
		this.buttons[curr.name]=this.paper.rect(this.startX+this.buttonWidth*colorIndex, this.buttonY,  this.buttonWidth, this.buttonHeight);
		this.buttons[curr.name].attr("fill", this.colors[colorIndex]);
		this.buttons[curr.name].attr("opacity", 0.5);
		self.buttons[curr.name]["visible"]=true;
		self.texts[curr.name]={};
		var arr=["max", "mid", "min"];

		if (active){
			var array=curr.values;
			if (curr.name!=curr.conversion){
				for (var k in arr){
					var key=arr[k];
					self.texts[curr.name][key]=this.paper.text(this.startX+this.width+this.startX, this.startY + k*(this.height/2), curr.name+"\n"+array[key]);
					self.texts[curr.name][key].hide();
				}
			}
			else{
					self.texts[curr.name]["mid"]=this.paper.text(this.startX+this.width+this.startX, this.startY + (this.height/2), curr.name+"\n"+1);
					self.texts[curr.name]["mid"].hide();
			}
			(function(currN){	
				self.buttons[currN].hover(
					function(){
						this.attr("opacity", 0.8);
						self.selectGraph(currN, 3, true);
					},
					function(){
						this.attr("opacity", 0.5);
						self.selectGraph(currN, 2, false);
						if (this["visible"]){
								this.attr("opacity", 0.5)
							}
							else 	{
								this.attr("opacity", 0.3)
							}
					}
				);
				self.buttons[currN].click(
					function(){
						self.buttons[currN]["visible"]=!self.buttons[currN]["visible"];
						for (var i in self.line[currN]){
							if (self.buttons[currN]["visible"]){
								self.line[currN][i].show();
								this.attr("opacity", 0.5)
							}
							else 	{
								self.line[currN][i].hide();
								this.attr("opacity", 0.3)
							}
						};
					}
				);
			})(curr.name);
		}
		else{
			this.captions[curr.name].attr("fill", "#dddddd");
			this.buttons[curr.name].attr("opacity", 0.3);
		}
	}

	selectGraph(name, val, front){
		for (var j in this.line[name]){
			if (front){
			   this.line[name][j].toFront();
			}
		   this.line[name][j].attr("stroke-width", val);
		};

		for (var j in this.texts[name]){
			if (front){
				this.texts[name][j].show();
				this.text.toFront();
			} else{
				this.texts[name][j].hide();
			}
		}
	}

	sin_to_hex(i, phase, size) {
		var sin = Math.sin(Math.PI / size * 2 * i + phase);
		var int = Math.floor(sin * 127) + 128;
		var hex = int.toString(16);

		return hex.length === 1 ? "0"+hex : hex;
	}


}