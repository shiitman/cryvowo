function initInterface(graph, coinList, width, height) {
    /*$(window).resize(function () {
        initInterface(graph, coinList, window.innerWidth, window.innerHeight);
    });
    */
    $("#currency").change(function () {
        addCurrencyFromString($("#currency").val());
        updateCurrencyList();
        $("#currency").val("");
    });

    $("#showHour").click(function () {
        coinList.showLast("minute", 60);
    });
    $("#show12Hour").click(function () {
        coinList.showLast("minute", 720);
    });
    $("#show24Hour").click(function () {
        coinList.showLast("minute", 60 * 24);
    });
    $("#showWeek").click(function () {
        coinList.showLast("hour", 168);
    });
    $("#showMonth").click(function () {
        coinList.showLast("hour", 720);
    });
    $("#show3Month").click(function () {
        coinList.showLast("day", 90);
    });
    $("#showYear").click(function () {
        coinList.showLast("day", 365);
    });

    $("#chooseCurrency").change(function () {
        coinList.convertTo = $("#chooseCurrency").val();
        coinList.showLast();
    });

    /*
	$("#showCanvas").click(function() {
		graph.canvas.showCanvas();
		$("#showCanvas").hide();
		$("#hideCanvas").show();
	});

	$("#hideCanvas").click(function() {
		graph.canvas.hideCanvas();
		$("#hideCanvas").hide();
		$("#showCanvas").show();
	});

	$("#line").click(function() {
		graph.canvas.selectLine();
	});
	$("#curve").click(function() {
		graph.canvas.selectCurve();
	});
	$("#clearCanvas").click(function() {
		graph.canvas.clearCanvas();
	});
	*/

    $("#control>input").checkboxradio({
        icon: false, classes: { "ui-checkboxradio": "highlight" }
    });

    var control = $("#control").dialog({
        width: 80, height: 350, dialogClass: "no-close",
        position: { my: "left top", at: "left top", of: window }
    });

    var currency = $("#currencyWindow").dialog({
        width: 600, height: 140, minWidth: 600, dialogClass: "no-close",
        position: { my: "left bottom", at: "right top", of: control }
    });
    $("svg").appendTo("#raphaelCanvas");

    var raphWin = $("#raphaelCanvas").dialog({
        width: width * 0.8, height: height * 0.77, dialogClass: "no-close",
        position: { my: "left top", at: "left bottom", of: currency },
        resize: function (event, ui) { console.log(this, event); }
    });

    raphWin.resize(function () {
        console.log("Test");
    });
    $("#addImg").detach().appendTo($("#raphaelCanvas").parent().children(".ui-dialog-titlebar"));
    $("#addImg").button();

    $("#currencyWindow").dialog();
    $("#control").dialog();

    $("#addImg").click(function () {
        var svgText = graph.paper.toSVG();
        var a = document.createElement('a');
        a.download = 'cryptochart.svg';
        a.type = 'image/svg+xml';
        var blob = new Blob([svgText], { "type": "image/svg+xml" });
        a.href = (window.URL || webkitURL).createObjectURL(blob);
        a.click();
    });
}

function addCurrencyFromString(str) {
    var strings = str.match(/(.*)\((.*)\).*/);
    if (strings.length < 3) {
        return;
    }
    var currName = strings[1];
    var newCurr = strings[2];
    console.log(newCurr);
    if ($("#currlist>#" + newCurr).length === 0) {
        $("#currlist").append(`<span id="${newCurr}" title="${currName} - click to remove">${newCurr}</span>`);
        $("#currlist>#" + newCurr).click(function () {
            this.remove();
            updateCurrencyList();
        });
    }
    $(`#currlist>#${newCurr}`).button();
}