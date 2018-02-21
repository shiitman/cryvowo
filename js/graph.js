class DrawGraph {
    constructor(raphael, startX, startY, buttonY, buttWidth, buttHeight, width, height) {
        this.paper = raphael;

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

        this.valuesShow = 1;
        this.currencies = [];
        this.valuesShow = 720;

        this.resetPaper();
        this.showAxes();
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
        this.paper.clear();
        this.text = this.paper.text(0, 0, "").attr("font-weight", "bold");
        this.textBackground = this.paper.rect(0, 0, this.textRectSide, this.textRectSide).attr({ "opacity": 0.7, "fill": "#ffffff" });
        this.textBackground.hide();
    }

    initColors(size) {
        var sin_to_hex = function (i, phase, size) {
            var sin = Math.sin(Math.PI / size * 2 * i + phase);
            var int = Math.floor(sin * 127) + 128;
            var hex = int.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }

        this.colors[0] = "#000000";
        for (var i = 1; i < size + 1; i++) {
            this.colors[i] = "#" + sin_to_hex(i, 0, size) + sin_to_hex(i, Math.PI * 2 / 3, size) + sin_to_hex(i, Math.PI * 4 / 3, size);
        }
    }

    showAxes() {
        this.coords = this.paper.path("M" + this.startX + " " + this.startY + "L" + this.startX + " " + (this.height + this.startY) + "L" + (this.width + this.startX) + " " + (this.height + this.startY));
    }

    showTimestamps(hourOrMinute, date) {
        var currentDate = date * 1000;

        var timeStep = 60 * 1000 * ((hourOrMinute == "hour") ? 60 : 1);

        if (hourOrMinute == "day") {
            timeStep = timeStep * 60 * 24;
        }
        this.timestamps = [];
        for (var i = this.timeStampsCount; i > 0; i--) {
            var timestamp = this.paper.text((this.width / this.timeStampsCount) * i + this.startX, this.height + this.startY + 15, this.formatDate(currentDate - (this.timeStampsCount - i) * timeStep * this.valuesShow / this.timeStampsCount));
            this.paper.path("M" + ((this.width / this.timeStampsCount) * i + this.startX) + " " + (this.height + this.startY - 10) + "L" + ((this.width / this.timeStampsCount) * i + this.startX) + " " + (this.height + this.startY + 10));
        }
        this.timelinesReady = true;
    }

    addCurrency(curr) {
        var self = this;
        this.line[curr.name] = [];
        this.currencies[curr.name] = curr;
        for (var i in this.currencies[curr.name].values["data"]) {
            if (this.maxVal < Math.abs(this.currencies[curr.name].values["data"][i].relative)) {
                this.maxVal = Math.abs(this.currencies[curr.name].values["data"][i].relative);
            }
        }
    }

    drawGraph(hourOrMinute = null, count = null) {
        this.initColors(Object.keys(this.currencies).length);
        this.showAxes();

        if (hourOrMinute != null) {
            this.hourOrMinute = hourOrMinute;
        }
        else {
            hourOrMinute = this.hourOrMinute;
        }
        if (count != null) {
            this.valuesShow = count;
        }
        this.timelinesReady = false;
        var step = (this.width) / this.valuesShow;
        var diff = this.height / (this.maxVal * 2);

        for (let i = 0; i < 21; i++) {
            this.paper.text(this.startX - 20, this.startY + i * this.height / 20, (Math.round((0 - i + 10) * this.maxVal / 10) + 100) + "%");
            this.paper.path(`M${(this.startX - 5)} ${(this.startY + i * this.height / 20)} L${(this.startX + 5)} ${(this.startY + i * this.height / 20)}`).attr("stroke-dasharray", "-..");
        }

        for (var curname in this.currencies) {
            var colorIndex = this.currencies[curname].index;
            var array = this.currencies[curname].values;
            var active = true;
            var newLine = new Graph(this, curname);

            if (this.currencies[curname].conversion != curname) {
                if (array.length > 0 || array.hasOwnProperty("data") > 0) {
                    if (!this.timelinesReady) {
                        this.showTimestamps(hourOrMinute, array["data"][array["data"].length - 1].time)
                    }
                    for (var i = 0; i < this.valuesShow - 1; i++) {
                        newLine.addPath(Math.round(step * i + this.startX), Math.round(this.height / 2 - diff * array["data"][i].relative + this.startY), Math.round(step * (i + 1) + this.startX), Math.round(this.height / 2 - diff * array["data"][i + 1].relative + this.startY), this.colors[colorIndex], array["data"][i].value, this.formatDate(array["data"][i].time * 1000));
                    }
                    //
                }
                else {
                    active = false;
                }
            }
            else {
                newLine.addPath(this.startX, Math.round(this.height / 2 + this.startY), this.startX + this.width, Math.round(this.height / 2 + this.startY), this.colors[colorIndex], curname, 1, "");
            }
            newLine.textValues(array, ["max", "mid", "min"], diff);
            this.line[curname] = newLine;

            var button = new CurrencyButton(this.buttonWidth, this.buttonHeight, newLine);
            button.addButton(this.startX + this.buttonWidth * colorIndex, this.buttonY, this.colors[colorIndex], curname, active)
            this.buttons[curname] = button;
        }
    }

    formatDate(time) {
        var date = new Date(time)

        var dates = [];
        dates[0] = (date.getMonth() + 1).toString();
        dates[1] = (date.getDate()).toString();
        dates[2] = (date.getHours()).toString();
        dates[3] = (date.getMinutes()).toString();
        dates[4] = (date.getYear() - 100).toString();

        for (var d in dates) {
            if (dates[d].length < 2)
                dates[d] = "0" + dates[d];
        }
        return (dates[0] + "." + dates[1] + "." + dates[4] + "\n" + dates[2] + ":" + dates[3]);
    }

    showTextValue(x, y, cur, val, time) {
        this.textBackground.show();
        this.textBackground.attr({ "x": x - 25, "y": y - 75 });
        this.textBackground.toFront();
        this.text.attr("text", cur + "\n" + val + "\n" + time);
        this.text.attr({ "x": x, "y": y - 50 });
        this.text.show();
        this.text.toFront();
    }

    removeText() {
        this.textBackground.hide();
        this.text.hide();
    }

    drawCross(e) {
        var self = this;
        self.vertical = self.paper.path("M" + (e.offsetX) + " " + self.startY + "L" + (e.offsetX) + " " + (self.startY + self.height)).attr('stroke-dasharray', "-..");
        self.horizontal = self.paper.path("M" + (self.startX) + " " + e.offsetY + "L" + (self.startX + self.width) + " " + (e.offsetY)).attr('stroke-dasharray', "-..");
    }

    removeCross() {
        if (this.vertical) {
            this.vertical.remove();
            this.vertical = null;
        }

        if (this.horizontal) {
            this.horizontal.remove();
            this.horizontal = null;
        }
    }
}

class Graph {
    constructor(draw, name) {
        this.path = null;
        this.draw = draw;
        this.paper = draw.paper;
        this.line = [];
        this.values = [];
        this.name = name;
        this.visible = true;
    }

    textValues(array, val, diff) {
        for (var k in val) {
            var key = val[k];
            this.values[key] = this.paper.text(this.draw.startX + this.draw.width + this.draw.startX, Math.round(this.draw.height / 2 - diff * array[key + "_r"] + this.draw.startY), this.name + "\n" + array[key]);
            this.values[key].hide();
        }
    }

    addPath(x1, y1, x2, y2, color, value, timestamp) {
        var newPath = new PathFragment(this);
        newPath.drawPath(x1, y1, x2, y2, color, this.name, value, timestamp);
        this.line.push(newPath);
    }
    hide() {
        for (var path in this.line) {
            this.line[path].hide();
            this.visible = false;
        }
    }
    show() {
        for (var path in this.line) {
            this.line[path].show();
            this.visible = true;
        }
    }

    selectGraph(width, front) {
        for (var j in this.line) {
            if (front) {
                this.line[j].toFront();
            }
            this.line[j].path.attr("stroke-width", width);
        }

        for (var j in this.values) {
            if (front) {
                this.values[j].show();
            } else {
                this.values[j].hide();
            }
        }
    }
}

class PathFragment {
    constructor(graph) {
        this.path = null;
        this.graph = graph;
        this.draw = graph.draw;
        this.paper = graph.paper;
    }

    drawPath(x1, y1, x2, y2, color, currency, value, timestamp) {
        if (this.path) {
            this.path.remove();
        }
        this.path = this.paper.path(`M${x1} ${y1} L${x2} ${y2}`).attr({
            "stroke": color, "stroke-width": 2
        });

        this.currency = currency;
        this.value = value;
        this.color = color;
        this.time = timestamp;
        this.createHoverFunction();
    }

    remove() {
        if (this.path) {
            this.path.remove();
        }
    }

    hide() {
        if (this.path) {
            this.path.hide();
        }
    }

    show() {
        if (this.path) {
            this.path.show();
        }
    }

    createHoverFunction() {
        var self = this;

        this.path.hover(
            function (e) {
                self.draw.drawCross(e);

                self.circle = self.paper.circle(e.offsetX, e.offsetY, 6);
                self.circle.attr("fill", self.color);
                if (self.graph.line.length > 1) {
                    self.draw.showTextValue(e.offsetX, e.offsetY, self.currency, self.value, self.time);
                }

                self.graph.selectGraph(3, true)

                this.toFront();
            },
            function () {
                self.draw.removeCross();
                self.draw.removeText();
                self.graph.selectGraph(2, false)
                if (self.circle) {
                    self.circle.remove();
                    self.circle = null;
                }
            }
        );

        this.path.click(
            function () {
            }
        );
    }
    toFront() {
        this.path.toFront();
    }
}

class CurrencyButton {
    constructor(buttonWidth, buttonHeight, graph) {
        this.paper = graph.paper;
        this.curr = graph.curr;
        this.buttonWidth = buttonWidth;
        this.buttonHeight = buttonHeight;
        this.graph = graph;
    }

    addButton(x, y, color, caption, active, arr) {
        var self = this;
        this.caption = this.paper.text(x + this.buttonWidth / 2, y + this.buttonHeight / 2, caption).attr("fill", "#050505");;
        this.button = this.paper.rect(x, y, this.buttonWidth, this.buttonHeight).attr({ "fill": color, "opacity": 0.5 });

        var diff = this.height / (this.maxVal * 2);

        if (active) {
            self.button.hover(
                function () {
                    this.attr("opacity", 0.8);
                    self.graph.selectGraph(3, true);
                },
                function () {
                    this.attr("opacity", 0.5);
                    self.graph.selectGraph(2, false);
                    if (self.graph["visible"]) {
                        this.attr("opacity", 0.5)
                    }
                    else {
                        this.attr("opacity", 0.3)
                    }
                }
            );
            self.button.click(
                function () {
                    self.graph.visible = !self.graph.visible;
                    if (self.graph["visible"]) {
                        self.graph.show();
                        this.attr("opacity", 0.5)
                    } else {
                        self.graph.hide();
                        this.attr("opacity", 0.3)
                    }
                }
            );
        }
        else {
            this.caption.attr({ "fill": "#dddddd" });
            this.button.attr("opacity", 0.3);
        }
    }
}