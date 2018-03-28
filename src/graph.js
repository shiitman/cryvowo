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
    this.svg = svg;
    this.startX = startX;
    this.startY = startY;
    this.buttonY = buttonY;
    this.buttonWidth = buttWidth;
    this.buttonHeight = buttHeight;

    this.height = height - startY * 2 - 10;
    this.width = width - startX - 10;

    this.div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    this.resetPaper();
  }

  resize(startX, startY, buttonY, buttWidth, buttHeight, width, height) {
    this.startX = startX;
    this.startY = startY;
    this.buttonY = buttonY;
    this.buttonWidth = buttWidth;
    this.buttonHeight = buttHeight;

    this.height = height - startY * 2 - 10;
    this.width = width - startX - 10;

    this.drawGraph();
  }

  resetPaper() {
    this.resetGraph();
    this.colors = [];
  }

  resetGraph() {
    this.svg.selectAll("*").remove();
  }

  initColors(currencies, size) {

    console.log(currencies, size);
    for (let i = 0; i < size; i++) {

      this.colors[i] = this.generateColor(currencies[i].name + "/" + currencies[i].name);
    }
  }

  generateColor(str) {
    let hash = 0;
    if (str.length == 0) return hash;
    for (let i = 0; i < str.length; i++) {
      let char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    var colors = [0x990000, 0x009900, 0x000099];

    hash = (hash) % (16777216 /*2097152 16777216*/ ); //
    for (let j = 0; j < 3; j++) {
      colors[j] = (((hash & colors[j]) >> (16 - j * 8)) + 0x22).toString(16);
      colors[j] = (colors[j].length == 1 ? "0" + colors[j] : colors[j]);
    }
    console.log(str, "#" + (colors[0] + colors[1] + colors[2]));
    return ("#" + (colors[0] + colors[1] + colors[2]));
  }


  drawGraph(coinlist) {
    var self = this;
    if (coinlist) {
      this.coinlist = coinlist;
    }
    if (!coinlist) {
      coinlist = this.coinlist;
    }
    if (!coinlist || coinlist.isLoading) {
      return;
    }

    this.resetPaper();

    this.initColors(coinlist.currencies, coinlist.currencies.length);

    var maxVal = coinlist.currencies.reduce(function(a, b) {
      return Math.max(a, b.values.maxRelative);
    }, 0);

    var timeFrom = coinlist.currencies.reduce(function(a, b) {
      return Math.min(a, b.values.timeFrom);
    }, Number.MAX_VALUE);

    var timeTo = coinlist.currencies.reduce(function(a, b) {
      return Math.max(a, b.values.timeTo);
    }, 0);

    var scaleY = d3.scaleLinear()
      .domain([100 + maxVal, 100 - maxVal])
      .range([0, this.height]);


    var scaleX = d3.scaleTime()
      .domain([new Date(timeFrom * 1000 - 1), new Date(timeTo * 1000 + 1)])
      .range([0, this.width]);

    var timeFormat = d3.timeFormat("%H:%M %d-%m-%Y");

    var y_axis = d3.axisLeft().ticks(20).scale(scaleY);
    var x_axis = d3.axisBottom().ticks(20).tickFormat(timeFormat).scale(scaleX);

    this.svg.append("g").attr("transform", `translate(${this.startX},${this.startY})`).call(y_axis);
    this.svg.append("g").attr("transform", `translate(${this.startX}, ${this.height+ this.startY})`)
      .call(x_axis).selectAll("text")
      .style("text-anchor", "end").text(function(d) {
        var t = d3.select(this.parentNode).append("text").style("text-anchor", "end").attr("fill", "black").text(timeFormat(d).toString().split(" ")[0]).attr("dx", "-1.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)");
        return timeFormat(d).toString().split(" ")[1];
      })
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    // add the X gridlines
    this.svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${self.startX}, ${self.height + self.startY})`)
      .call(d3.axisBottom(scaleX)
        .ticks(10)
        .tickSize(-self.height)
        .tickFormat("")
      );

    // add the Y gridlines
    this.svg.append("g")
      .attr("transform", `translate(${self.startX}, ${self.startY})`)
      .attr("class", "grid")
      .call(d3.axisLeft(scaleY)
        .ticks(5)
        .tickSize(-self.width - self.startX)
        .tickFormat("")
      );

    var selectClick = function() {
      if (d3.select(this.parentNode).style("opacity") == 1) {
        d3.selectAll(".graph").style("opacity", 0.99);
      } else {
        d3.selectAll(".graph").style("opacity", 0.1);
        d3.select(this.parentNode).style("opacity", 1).moveToFront();
      }
    };

    //add text buttons
    this.svg.selectAll("rect").data(coinlist.currencies).enter().append("rect").attr("x", function(d, ind) {
        return self.startX + ind * self.buttonWidth;
      }).attr("width", self.buttonWidth)
      .attr("height", self.buttonHeight * 1.8)
      .attr("y", self.buttonY)
      .attr("fill", function(d, ind) {
        return self.colors[ind];
      })
      .attr("class", "button")
      .on("click", function(d) {
        self.svg.select(".graph.c_" + d.name + " > path").node().dispatchEvent(new MouseEvent("click"));
      });

    this.svg.selectAll("text.buttonLabel").data(coinlist.currencies).enter().append("text").attr("x", function(d, ind) {
        return self.startX + ind * self.buttonWidth + self.buttonWidth * 0.5;
      }).attr("fill", function(d, ind) {
        return self.colors[ind];
      })
      .attr("y", self.buttonY + self.buttonHeight * 0.6).text(function(d) {
        return d.name;
      }).attr("class", "buttonLabel").attr("font-size", self.buttonHeight * 0.6).attr("text-anchor", "middle");

    this.svg.selectAll("text.caption").data(coinlist.currencies).enter().append("text").attr("x", function(d, ind) {
        return self.startX + ind * self.buttonWidth + self.buttonWidth * 0.5;
      }).attr("y", self.buttonY + self.buttonHeight * 0.6 * 2).text(function(d) {
        return d.values.data[d.values.data.length - 1].close;
      }).attr("class", "buttonLabel caption").attr("fill", function(d, ind) {
        return self.colors[ind];
      })
      .attr("font-size", self.buttonHeight * 0.6).attr("text-anchor", "middle");

    //drawgraph
    var valueline = d3.line()
      .x(function(d) {
        return scaleX(d.time * 1000);
      })
      .y(function(d) {
        return scaleY(d.relative + 100);
      });

    coinlist.currencies.forEach(function(curr, index) {
      let g = self.svg.append("g").attr("class", "graph c_" + curr.name);
      //  console.log(self.generateColor(curr.name));
      g.append("path")
        .data([curr.values.data])
        .attr("class", "path c_" + curr.name)
        .attr("d", valueline).attr("fill", "transparent")
        .attr("stroke", self.colors[index])
        .attr("transform", `translate(${self.startX},${self.startY})`)
        .on("click", selectClick)
        .moveToBack();

      g.selectAll("circle .c_" + curr.name)
        .data(curr.values.data).enter().append("circle")
        .attr("class", "c_" + curr.name)
        .attr("cx", function(d) {
          return scaleX(d.time * 1000);
        })
        .attr("cy", function(d) {
          return scaleY(d.relative + 100);
        })
        .attr("r", 1)
        .attr("transform", `translate(${self.startX},${self.startY})`)
        .attr("fill", self.colors[index]).attr("stroke", self.colors[index]).moveToFront()
        .on("click", selectClick)
        .on("mouseover", function(d) {
          d3.select(this).attr("r", 4);
          self.div.transition()
            .duration(200).style("display", "block")
            .style("opacity", 0.9);
          self.div.html(coinlist[index].name + "<br \>" + d.close + " " + coinlist.convertTo + "<br \>" + timeFormat(new Date(d.time * 1000)))
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
    });
  }

}
