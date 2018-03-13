/*jshint esversion: 6 */

// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {
  return this.each(function() {
    var firstChild = this.parentNode.firstChild;
    if (firstChild) {
      this.parentNode.insertBefore(this, firstChild);
    }
  });
};


class DrawGraph {
  constructor(svg, startX, startY, buttonY, buttWidth, buttHeight, width, height) {
    //    this.paper = raphael;
    this.svg = svg;
    this.startX = startX;
    this.startY = startY;
    this.buttonY = buttonY;
    this.buttonWidth = buttWidth;
    this.buttonHeight = buttHeight;

    this.height = height;
    this.width = width;
    this.textRectSide = 50;
    this.timeStampsCount = 20;
    this.hourOrMinute = "minute";

    this.div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    this.resetPaper();
  }

  resizePaper(x, y, w, h) {
    this.startX = x;
    this.startY = y;
    this.height = h;
    this.width = w;

    this.resetGraph();
  }

  resetPaper() {
    this.resetGraph();
    this.currencies = [];
    this.maxVal = 0;
    this.line = [];
    this.texts = [];
    this.colors = [];
    this.buttons = [];
    this.captions = [];

    //    this.canvas = new DrawCanvas(this.startX, this.startY, this.width, this.height, this.paper);
  }

  resetGraph() {
    this.svg.selectAll("*").remove();
  }

  initColors(size) {
    var sin_to_hex = function(i, phase, size) {
      var sin = Math.sin(Math.PI / size * 2 * i + phase);
      var int = Math.floor(sin * 127) + 128;
      var hex = int.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    this.colors[0] = "#000000";
    for (var i = 1; i < size + 1; i++) {
      this.colors[i] = "#" + sin_to_hex(i, 0, size) + sin_to_hex(i, Math.PI * 2 / 3, size) + sin_to_hex(i, Math.PI * 4 / 3, size);
    }
  }

  drawGraph(coinlist, hourOrMinute = null, count = null) {
    var self = this;
    this.resetPaper();
    var maxVal = 0;
    var timeFrom = Number.MAX_VALUE;
    var timeTo = 0;
    this.initColors(coinlist.currencies.length);

    for (let currI in coinlist.currencies) {
      let curr = coinlist.currencies[currI];
      for (var i in curr.values.data) {
        if (maxVal < Math.abs(curr.values.data[i].relative)) {
          maxVal = Math.abs(curr.values.data[i].relative);
        }

        if (timeFrom > curr.values.timeFrom) {
          timeFrom = curr.values.timeFrom;
        }

        if (timeTo < curr.values.timeTo) {
          timeTo = curr.values.timeTo;
        }

      }
    }

    //    console.log(timeFrom, timeTo);
    var scale = d3.scaleLinear()
      .domain([100 + maxVal, 100 - maxVal])
      .range([0, this.height]);

    var mindate = new Date(timeFrom * 1000 - 1),
      maxdate = new Date(timeTo * 1000 + 1);

    var scale2 = d3.scaleTime()
      .domain([mindate, maxdate /* maxdate*/ ])
      .range([0, this.width]);

    var x = d3.scaleTime().range([0, this.width]);
    var y = d3.scaleLinear().range([this.height, 0]);

    var timeFormat = d3.timeFormat("%H:%M %d-%m-%Y");

    var y_axis = d3.axisLeft().ticks(20).scale(scale);
    var x_axis = d3.axisBottom().ticks(20).tickFormat(timeFormat).scale(scale2);

    this.svg.append("g").attr("transform", `translate(${this.startX},${this.startY})`).call(y_axis);
    this.svg.append("g").attr("transform", `translate(${this.startX}, ${this.height+ this.startY})`)
      .call(x_axis).selectAll("text")
      .style("text-anchor", "end").text(function(d) {
        //        console.log(this.parentNode);
        var t = d3.select(this.parentNode).append("text").style("text-anchor", "end").attr("fill", "black").text(timeFormat(d).toString().split(" ")[0]).attr("dx", "-1.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)");
        //      console.log(t);
        return timeFormat(d).toString().split(" ")[1];
      })
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    var valueline = d3.line()
      .x(function(d) {
        return scale2(d.time * 1000);
      })
      .y(function(d) {
        return scale(d.relative + 100);
      });

    this.svg.selectAll("rect").data(coinlist.currencies).enter().append("rect").attr("x", function(d, ind) {
      return self.startX + ind * self.buttonWidth;
    }).attr("width", self.buttonWidth).attr("height", self.buttonHeight * 1.8).attr("y", self.buttonY).attr("fill", function(d, ind) {
      return self.colors[ind];
    }).attr("opacity", 0.6);

    this.svg.selectAll("text.buttons").data(coinlist.currencies).enter().append("text").attr("x", function(d, ind) {
      return self.startX + ind * self.buttonWidth + self.buttonWidth * 0.5;
    }).attr("y", self.buttonY + self.buttonHeight * 0.6).text(function(d) {
      return d.name;
    }).attr("class", "button").attr("font-size", self.buttonHeight * 0.6).attr("text-anchor", "middle");

    this.svg.selectAll("text.captions").data(coinlist.currencies).enter().append("text").attr("x", function(d, ind) {
      return self.startX + ind * self.buttonWidth + self.buttonWidth * 0.5;
    }).attr("y", self.buttonY + self.buttonHeight * 0.6 * 2).text(function(d) {
      return d.values.data[d.values.data.length - 1].close;
    }).attr("class", "button").attr("font-size", self.buttonHeight * 0.6).attr("text-anchor", "middle");

    for (let currI in coinlist.currencies) {
      let curr = coinlist.currencies[currI];

      var path = this.svg.append("path")
        .data([curr.values.data])
        .attr("class", "line " + curr.name)
        .attr("d", valueline).attr("fill", "transparent").attr("stroke", this.colors[currI]).attr("transform", `translate(${this.startX},${this.startY})`).moveToBack();

      this.svg.selectAll("circle ." + curr.name)
        .data(curr.values.data).enter().append("circle")
        .attr("class", curr.name)
        .attr("cx", function(d) {
          return scale2(d.time * 1000);
        })
        .attr("cy", function(d) {
          return scale(d.relative + 100);
        })
        .attr("r", 1)
        .attr("transform", `translate(${this.startX},${this.startY})`)
        .attr("fill", this.colors[currI]).attr("stroke", this.colors[currI]).on("click", function(d) {
          //  console.log(this);
        }).moveToFront()
        .on("mouseover", function(d) {
          d3.select(this).attr("r", 4);
          self.div.transition()
            .duration(200).style("display", "block")
            .style("opacity", 0.9);
          self.div.html(d.close + " " + coinlist.convertTo + "<br \>" + timeFormat(new Date(d.time * 1000)))
            .style("position", "absolute")
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 45) + "px");
        })
        .on("mouseout", function(d) {
          d3.select(this).attr("r", 1);
          self.div.transition()
            .duration(500)
            .style("opacity", 0).style("display", "none");
        });
    }
  }

}