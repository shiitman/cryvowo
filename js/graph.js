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

        this.canvas = new DrawCanvas(this.startX, this.startY, this.width, this.height, this.paper);
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

    addButton(curr, colorIndex, active) {
        var self = this;
        this.captions[curr.name] = this.paper.text(this.startX + this.buttonWidth * colorIndex + this.buttonWidth / 2, this.buttonY + this.buttonHeight / 2, curr.name).attr("fill", "#050505");;
        this.buttons[curr.name] = this.paper.rect(this.startX + this.buttonWidth * colorIndex, this.buttonY, this.buttonWidth, this.buttonHeight);
        this.buttons[curr.name].attr("fill", this.colors[colorIndex]);
        this.buttons[curr.name].attr("opacity", 0.5);
        self.buttons[curr.name]["visible"] = true;
        self.texts[curr.name] = {};
        var arr = ["max", "mid", "min"];

        var diff = this.height / (this.maxVal * 2);

        if (active) {
            var array = curr.values;
            if (curr.name != curr.conversion) {
                for (var k in arr) {
                    var key = arr[k];
                    self.texts[curr.name][key] = this.paper.text(this.startX + this.width + this.startX, Math.round(this.height / 2 - diff * array[key + "_r"] + this.startY), curr.name + "\n" + array[key]);
                    self.texts[curr.name][key].hide();
                }
            }
            else {
                self.texts[curr.name]["mid"] = this.paper.text(this.startX + this.width + this.startX, this.startY + (this.height / 2), curr.name + "\n" + 1);
                self.texts[curr.name]["mid"].hide();
            }
            (function (currN) {
                self.buttons[currN].hover(
                    function () {
                        this.attr("opacity", 0.8);
                        self.selectGraph(currN, 3, true);
                    },
                    function () {
                        this.attr("opacity", 0.5);
                        self.selectGraph(currN, 2, false);
                        if (this["visible"]) {
                            this.attr("opacity", 0.5)
                        }
                        else {
                            this.attr("opacity", 0.3)
                        }
                    }
                );
                self.buttons[currN].click(
                    function () {
                        self.buttons[currN]["visible"] = !self.buttons[currN]["visible"];
                        for (var i in self.line[currN]) {
                            if (self.buttons[currN]["visible"]) {
                                self.line[currN][i].show();
                                this.attr("opacity", 0.5)
                            }
                            else {
                                self.line[currN][i].hide();
                                this.attr("opacity", 0.3)
                            }
                        };
                    }
                );
            })(curr.name);
        }
        else {
            this.captions[curr.name].attr("fill", "#dddddd");
            this.buttons[curr.name].attr("opacity", 0.3);
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

            if (this.currencies[curname].conversion != curname) {
                if (array.length > 0 || array.hasOwnProperty("data") > 0) {
                    if (!this.timelinesReady) {
                        this.showTimestamps(hourOrMinute, array["data"][array["data"].length - 1].time)
                    }
                    for (var i = 0; i < this.valuesShow - 1; i++) {
                        var pathStr = "M" + Math.round(step * i + this.startX) + " " + Math.round(this.height / 2 - diff * array["data"][i].relative + this.startY);
                        pathStr += "L" + Math.round(step * (i + 1) + this.startX) + " " + Math.round(this.height / 2 - diff * array["data"][i + 1].relative + this.startY);

                        var newPath = this.paper.path(pathStr);

                        newPath.X = Math.round(step * i + this.startX);
                        newPath.Y = Math.round(this.height / 2 - diff * array["data"][i].relative + this.startY);
                        newPath.VAL = array["data"][i].value;
                        newPath.INDEX = i;
                        newPath.TIME = this.formatDate(array["data"][i].time * 1000);
                        newPath.COLOR = this.colors[colorIndex];
                        newPath.CUR = curname;
                        this.createHoverFunction(newPath);

                        newPath.attr("stroke", this.colors[colorIndex]).attr("stroke-width", 2);

                        //	console.log(curname);
                        if (!this.line[curname])
                            console.log(curname, "error");

                        this.line[curname].push(newPath);
                    }
                }
                else {
                    active = false;
                }
            }
            else {
                var pathStr = "M" + this.startX + " " + Math.round(this.height / 2 + this.startY);
                pathStr += "L" + (this.startX + this.width) + " " + Math.round(this.height / 2 + this.startY);
                var newPath = this.paper.path(pathStr);
                newPath.X = self.startX + self.width / 2;
                newPath.Y = self.startY;
                newPath.VAL = 1;
                newPath.INDEX = 0;

                newPath.TIME = "";
                newPath.COLOR = this.colors[colorIndex];
                newPath.CUR = curname;
                newPath.attr("stroke", this.colors[colorIndex]).attr("stroke-width", 2);
                this.createHoverFunction(newPath);

                this.line[curname].push(newPath);
            }
            this.addButton(this.currencies[curname], colorIndex, active);
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

    createHoverFunction(newPath) {
        var self = this;

        newPath.hover(
            function (e) {
                if (self.line[this.CUR].length > 1) {
                    self.vertical = self.paper.path("M" + (e.offsetX) + " " + self.startY + "L" + (e.offsetX) + " " + (self.startY + self.height)).attr('stroke-dasharray', "-..");
                    self.horizontal = self.paper.path("M" + (self.startX) + " " + e.offsetY + "L" + (self.startX + self.width) + " " + (e.offsetY)).attr('stroke-dasharray', "-..");
                    self.selectGraph(this.CUR, 3, true)
                    this.circle = self.paper.circle(e.offsetX, e.offsetY, 6).attr("fill", this.COLOR);
                    this.toFront();
                    self.showTextValue(this, e.offsetX, e.offsetY);
                }
                else {
                    self.selectGraph(this.CUR, 3, true)
                }
            },
            function () {
                if (self.line[this.CUR].length > 1) {
                    this.attr("stroke", this.COLOR);
                    self.selectGraph(this.CUR, 2, false)
                    self.vertical.remove();
                    self.horizontal.remove();
                    self.textBackground.hide();
                    self.text.hide();
                    this.circle.remove();
                }
                else {
                    self.selectGraph(this.CUR, 2, false)
                }
            }
        );

        newPath.click(
            function () {
            }
        );
    }

    showTextValue(path, x, y) {
        this.textBackground.show();
        this.textBackground.attr({ "x": x - 25, "y": y - 75 });
        this.textBackground.toFront();
        this.text.attr("text", path.CUR + "\n" + path.VAL + "\n" + path.TIME);
        this.text.attr({ "x": x, "y": y - 50 });
        this.text.show();
        this.text.toFront();
    }

    selectGraph(name, val, front) {
        for (var j in this.line[name]) {
            if (front) {
                this.line[name][j].toFront();
            }
            this.line[name][j].attr("stroke-width", val);
        };

        for (var j in this.texts[name]) {
            if (front) {
                this.texts[name][j].show();
                this.text.toFront();
            } else {
                this.texts[name][j].hide();
            }
        }
    }
}

class DrawCanvas {
    constructor(x, y, width, height, paper) {
        this.paper = paper;
        this.canvas = paper.rect(x - 20, y - 20, width + 40, height + 40).attr({ "opacity": 0.5, "fill": "#ffffff", "stroke": "#ffffff" });
        this.initCanvas();
        this.canvas.hide();
        this.canvas.drawMode = 0;
        this.figures = [];
    }

    initCanvas() {
        var self = this;
        var paper = this.paper;
        var canvas = this.canvas;
        canvas.isDrawing = false;

        canvas.interval = 0;

        canvas.mousedown(function (e) {
            if (!canvas.isDrawing) {
                canvas.isDrawing = true;
                this.startX = e.layerX;
                this.startY = e.layerY;
            }
        });

        canvas.mousemove(function (e) {
            if (canvas.drawMode == 0) {
                if (canvas.isDrawing) {
                    var y = e.layerY;
                    if (e.shiftKey) {
                        y = this.startY;
                    }
                    if (this.line != null) {
                        this.line.remove();
                    }
                    if (!(e.buttons & 1)) {
                        canvas.isDrawing = false;
                        var line = paper.path(`M${this.startX} ${this.startY} L${e.layerX} ${y}`).attr({ "stroke": "#ff0000", "stroke-width": 4 });
                        line.toFront();
                        self.figures.push(line);
                    }
                    else {
                        this.line = paper.path(`M${this.startX} ${this.startY} L${e.layerX} ${y}`).attr({ "stroke": "#ff0000", "stroke-width": 4 });
                    }
                }
            }
            else if (canvas.drawMode == 1) {
                if (canvas.isDrawing) {
                    canvas.interval++;
                    if (!(e.buttons & 1)) {
                        canvas.isDrawing = false;

                        var line = paper.path(`M${this.startX} ${this.startY} L${e.layerX} ${e.layerY}`).attr({ "stroke": "#ff0000", "stroke-width": 4 });
                        line.toFront();
                        self.figures.push(line);
                        this.startX = e.layerX;
                        this.startY = e.layerY;
                    }
                    else {
                        if (canvas.interval >= 5) {
                            var line = paper.path(`M${this.startX} ${this.startY} L${e.layerX} ${e.layerY}`).attr({ "stroke": "#ff0000", "stroke-width": 4 });
                            self.figures.push(line);
                            this.startX = e.layerX;
                            this.startY = e.layerY;
                            canvas.interval = 0;
                        }
                    }
                }
            }
        });
    }

    clearCanvas() {
        for (var i = 0; i < this.figures.length; i++) {
            this.figures[i].remove();
        }
        this.figures = [];
    }

    hideCanvas() {
        this.canvas.hide();
        //		this.clearCanvas();
        for (var i = 0; i < this.figures.length; i++) {
            this.figures[i].hide();
        }
    }

    selectCurve() {
        var canvas = this.canvas;
        canvas.drawMode = 1;
        console.log(canvas.drawMode);
    }

    selectLine() {
        var canvas = this.canvas;
        canvas.drawMode = 0;
    }
    showCanvas() {
        this.canvas.show();
        this.canvas.toFront();
        for (var i = 0; i < this.figures.length; i++) {
            this.figures[i].show();
            this.figures[i].toFront();
        }
    }
}