function init(){

	var coinList=new Coinlist();
	coinList.getCoins($("#currencies"));

	$("#showHour").prop("disabled", false);
	$("#show12Hour").prop("disabled", false);
	$("#show24Hour").prop("disabled", false);
	$("#showWeek").prop("disabled", false);
	$("#showMonth").prop("disabled", false);
	$("#show3Month").prop("disabled", false);
	$("#showYear").prop("disabled", false);

	$("#currency").change(function() {
		var newCurr=$("#currency").val();
		console.log(newCurr);
		if ($("#currlist>#"+newCurr).length==0){
			$("#currlist").append(`<span id="${newCurr}" title="click to remove">${newCurr} </span>`);
			$("#currlist>#"+newCurr).click(function(){
				this.remove();
				var str=updateCurrencyList();
				coinList.upgradeCurrList(str);
				coinList.showLast();
			});
			var str=updateCurrencyList();
			coinList.upgradeCurrList(str);
			coinList.showLast();
		}
		$("#currency").val("");
	});

	$("#showHour").click(function() {
		coinList.showLast("minute", 60);
	});	
	$("#show12Hour").click(function() {
		coinList.showLast("minute", 720);
	});
	$("#show24Hour").click(function() {
		coinList.showLast("minute", 60*24);
	});
	$("#showWeek").click(function() {
		coinList.showLast("hour", 168);
	});	
	$("#showMonth").click(function() {
		coinList.showLast("hour", 720);
	});
	$("#show3Month").click(function() {
		coinList.showLast("day", 90);
	});
	$("#showYear").click(function() {
		coinList.showLast("day",365);
	});
	$("#chooseCurrency").change(function() {
		coinList.convertTo=$("#chooseCurrency").val();
		coinList.showLast();
	});
			coinList.showLast();

}

function deleteMe(){

}

function updateCurrencyList(){
var currs="";
	$("#currlist>span").each(
		function(){
			currs+=this.id+",";
		}
	);
	currs = currs.slice(0, -1);
	
	return currs;
}
$(document).ready(function() {
	init();
});
