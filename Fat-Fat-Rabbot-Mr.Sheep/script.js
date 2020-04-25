//Constants
let EN = ExpantaNum;
let game;
const savePath = "AIGSave.txt"
const multiplierReq = [
  EN(10),
  EN("1e5"),
  EN("1e9"),
  EN("1e13"),
  EN("1e17"),
  EN("eee10000")
];
const autoReq = EN(50);
const autoMultiReq = [
	EN("5e2"),
	EN("5e6"),
	EN("5e10"),
	EN("5e14"),
	EN("5e18"),
];
const rabbotBasePrice = EN("1e21")
const bulkBuying = [
  EN(1),
  EN(10),
  EN(100),
  EN(Infinity),
];
const gameStrings = {
	FFC: "Fat Fat Coin",
	FF1: "Fat Fat Worker",
	FF2: "Fat Fat Supervisor",
	FF3: "Fat Fat Manager",
	FF4: "Fat Fat Director",
	FF5: "Fat Fat Overseer",
	Rabbot: "Rabbot",
	On: "On",
	Off: "Off"
};

//Utility functions
function squareRootSum(n) {
	let m = EN.floor(n.pow(0.5));
	return m.times(n.sub((m.pow(2).times(2).add(m.times(3).sub(5))).div(6))).round();
}
function beautifyNumber(number,f=0) {
  if (typeof number == "number") {
  if (number==Infinity) {
    return "Infinity"
  } else if (10**265 > number) {
  if (10**257>number) {
	let exponent = Math.floor(Math.log10(number+0.1))
	let mantissa = number / Math.pow(10, exponent)
	if (exponent < 6) return Math.round(number)
  if (mantissa.toFixed(3)=="10.000") return "9.999e" + exponent
	return mantissa.toFixed(3) + "e" + exponent
  } else {
    return "1.000e300"
  }
  } else {
    return "g<sub>" + displayOrd(number-10**270,3) + "</sub> (10)"
  }} else {
    return beautifyEN(number,f)
  }
}
function beautifyEN(n,f=0) {
 let x = EN(n)
  if (x.lte(1e5)) {
    return (f==0?x.floor().toString():x.toNumber().toFixed(f))
  } else if (x.lte("ee5")) {
    let exponent = x.log10().floor()
    let mantissa = x.divide(EN(10).pow(exponent)).toNumber().toFixed(2)
    if (mantissa=="10.00") exponent = exponent.add(1)
    if (mantissa=="10.00") mantissa = "1.00"
    return mantissa + "e" + beautifyNumber(exponent)
  } else {
    return x.floor().toString()
  }
}
function ENify(x) {
  if (typeof x == "number") {
    return EN(x)
  } else {
    let newEN = new EN(0)
    newEN.array = x.array
    newEN.sign = x.sign
    newEN.layer = x.layer
    return newEN
  }
}

//Game Functions


function reset() {
  game = {
    FFCoin: EN(0),
	Rabbot: EN(0),
    multi: [
      EN(0),
      EN(0),
      EN(0),
      EN(0),
      EN(0),
      EN(0)
    ],
	auto: -1,
	autoMultiplier: [-1, -1, -1, -1, -1],
	efficiencyBought: 0,
	efficiencyBase: EN(1.4),
	rabbotPriceMulti: EN(10),
	rabbotNow: EN(0)
  };
  
  showAll();
}

/*************
 * Save/Load *
 *************/
 
function saveGame() {
  localStorage.setItem(savePath, JSON.stringify(game));
}
function exportGame() {
  copyStringToClipboard(btoa(JSON.stringify(game)))
}
function copyStringToClipboard(str) {
  var el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style = {
    position: "absolute",
    left: "-9999px"
  };
  document.body.appendChild(el);
  copyToClipboard(el)
  document.body.removeChild(el);
  alert("Copied to clipboard")
}

function copyToClipboard(el) {
    el = (typeof el === "string") ? document.querySelector(el) : el;
    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
        var editable = el.contentEditable;
        var readOnly = el.readOnly;
        el.contentEditable = true;
        el.readOnly = true;
        var range = document.createRange();
        range.selectNodeContents(el);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        el.setSelectionRange(0, 999999);
        el.contentEditable = editable;
        el.readOnly = readOnly;
    }
    else {
        el.select();
    }
    document.execCommand("copy");
}
function importGame() {
  let loadgameTemp=""
  loadgameTemp = JSON.parse(atob(prompt("Paste in your save WARNING: WILL OVERWRITE YOUR CURRENT SAVE")))
  if (loadgameTemp!="") {
    loadingGame(loadgameTemp);
  }
  showAll();
}
function loadingGame(loadgameTemp) {
	game["FFCoin"] = ENify(loadgameTemp["FFCoin"]);
	game["Rabbot"] = ENify(loadgameTemp["Rabbot"]);
	game["multi"] = (loadgameTemp["multi"]).map(ENify);
	game["auto"] = Number(loadgameTemp["auto"]);
	game["autoMultiplier"] = (loadgameTemp["autoMultiplier"]).map(Number);;
	game["efficiencyBought"] = Number(loadgameTemp["efficiencyBought"]);
	game["efficiencyBase"] = ENify(loadgameTemp["efficiencyBase"]);
	game["rabbotPriceMulti"] = ENify(loadgameTemp["rabbotPriceMulti"]);
	game["rabbotNow"] = ENify(loadgameTemp["rabbotNow"]);
}
function loadGame() {
  var loadgameTemp = JSON.parse(localStorage.getItem(savePath));
  //document.getElementById("newline").innerHTML = localStorage.getItem(savePath);
  if (loadgameTemp != null) {
    reset();
    loadingGame(loadgameTemp);
	showAll();
  }
}


function gainFFCoin() {
  game.FFCoin = game.FFCoin.add(game.multi[0].add(1));
  showFFCoin();
}
function rabbotPrice() {
	return rabbotBasePrice.times(game.rabbotPriceMulti.pow(game.Rabbot));
}
function buyRabbot() {
	let price = rabbotPrice();
    if (game.FFCoin.gte(price)) {
		game.Rabbot = game.Rabbot.add(1);
		game.rabbotNow = game.rabbotNow.add(1);
		game.FFCoin = game.FFCoin.sub(price);		
		showFFCoin();
		showRabbot();
		showEfficiency();
    }
}
function useRabbot() {
	if (game.rabbotNow.gte(1)) {
		game.rabbotNow = game.rabbotNow.sub(1);
		game.efficiencyBase = game.efficiencyBase.add(0.1);
		showRabbot();
		showEfficiency();
	}
}
function multiplierPrice(n) {
	return (game.multi[n - 1].add(1).pow(0.5).times(multiplierReq[n - 1])).round();
}
function multiplier2(n) {
  let price = multiplierPrice(n);
  if (game.FFCoin.gte(price)) {
	game.multi[n - 1] = game.multi[n - 1].add(game.multi[n].add(1).times(game.efficiency));
	game.FFCoin = game.FFCoin.sub(price);
    showFFCoin();
    showMultipier();
  }
}

function functionAutoMulti(n){
	if(game.autoMultiplier[n-1] == -1) {
		if (game.FFCoin.gte(autoMultiReq[n-1])) {
			game.autoMultiplier[n-1] = 0;
			showAutoBuy();
		}
	}else{
		game.autoMultiplier[n-1] = 1 - game.autoMultiplier[n-1];
		showAutoBuy();
	}
}
function functionAutoGainCoin(n){
	if(game.auto == -1) {
		if (game.FFCoin.gte(autoReq)) {
			game.auto = 0;
			showAutoBuy();
		}
	}else{
		game.auto = 1 - game.auto;
		showAutoBuy();
	}
}

/**********
 * Render *
 **********/
 
function showAll() {
	showFFCoin();
	showMultipier();
	showAutoBuy();
	showRabbot();
	showEfficiency();
}

function showMultipier(){
	for (var n = 1; n < 6; n++) {
		document.getElementById("multi" + n).innerHTML = beautifyEN(game.multi[n - 1]);
		document.getElementById("multi" + n + "cost").innerHTML = beautifyEN(multiplierPrice(n));
	}  
}
function showFFCoin() {
	document.getElementById("FFCoin").innerHTML = beautifyEN(game.FFCoin);
}
function showRabbot() {
	document.getElementById("Rabbot").innerHTML = beautifyEN(game.rabbotNow) + "(" + beautifyEN(game.Rabbot) + ")";
	document.getElementById("rabbotCost").innerHTML = beautifyEN(rabbotPrice());
}
function showEfficiency() {
	game.efficiency = game.efficiencyBase.pow(game.rabbotNow);
	document.getElementById("efficiency").innerHTML = beautifyEN(game.efficiency) + "x";
}
function showAutoBuy() {
	for (var n = 1; n < 6; n++) {
		if (game.autoMultiplier[n-1] == 1) {
			document.getElementById("toggleAutoBuyMultiButton"+n).className = ("onButton");
			document.getElementById("toggleAutoBuyMultiButton"+n).innerHTML = "<div> Auto Employ "+gameStrings["FF"+n]+": </div><span style=\"vertical-align: middle; display: inline-block; line-height: normal;\" id=\"autoBuyMulti"+n+"\">ON</span>";
		}else if(game.autoMultiplier[n-1] == 0){
			document.getElementById("toggleAutoBuyMultiButton"+n).className = ("offButton");
			document.getElementById("toggleAutoBuyMultiButton"+n).innerHTML = "<div> Auto Employ "+gameStrings["FF"+n]+": </div><span style=\"vertical-align: middle; display: inline-block; line-height: normal;\" id=\"autoBuyMulti"+n+"\">OFF</span>";
		}else if(game.autoMultiplier[n-1] == -1){
			document.getElementById("toggleAutoBuyMultiButton"+n).className = ("lockedButton");
			document.getElementById("toggleAutoBuyMultiButton"+n).innerHTML = "<div>Unlock Auto Employing <text id=\"autoFF"+n+"\">" + gameStrings["FF"+n] + "</text></div><div>Cost: <data id=\"auto"+n+"cost\">" + beautifyEN(autoMultiReq[n-1]) + "</data> FFC</div>";
		}
	}
	if (game.auto == 1) {
		document.getElementById("toggleAutoGainCoinButton").className = ("onButton");
		document.getElementById("toggleAutoGainCoinButton").innerHTML = "<div> Auto Gain "+gameStrings["FFC"]+": </div> <text id=\"autoGainText\">ON</text>";
	}else if (game.auto == 0) {
		document.getElementById("toggleAutoGainCoinButton").className = ("offButton");
		document.getElementById("toggleAutoGainCoinButton").innerHTML = "<div> Auto Gain "+gameStrings["FFC"]+": </div> <text id=\"autoGainText\">OFF</text>";
	}else if (game.auto == -1) {
		document.getElementById("toggleAutoGainCoinButton").className = ("lockedButton");
		document.getElementById("toggleAutoGainCoinButton").innerHTML = "<div>Unlock Auto Gain <text id=\"autoFFC\">"+gameStrings["FFC"]+"</text></div><div>Cost: <data id=\"autoFFCcost\">"+beautifyEN(autoReq)+"</data> FFC</div>";
	}
}

function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}
/*
function toggleBulkBuying() {
  game.bulk = (game.bulk + 1) % bulkBuying.length;
  switch(game.bulk) {
	case 0:
	  document.getElementById("bulkBuyText").innerHTML = "1x";
	  break;
	case 1:
	  document.getElementById("bulkBuyText").innerHTML = "10x";
	  break;
	case 2:
	  document.getElementById("bulkBuyText").innerHTML = "100x";
	  break;
	case 3:
	  document.getElementById("bulkBuyText").innerHTML = "Max";
	  break;
	default:
	  document.getElementById("bulkBuyText").innerHTML = "1x";
  }
  showMultipier();
}
*/

//Run
reset();
window.setInterval(function() {
  if (game.auto == 1) gainFFCoin();
  if (game.autoMultiplier[0] == 1) multiplier2(1);
  if (game.autoMultiplier[1] == 1) multiplier2(2);
  if (game.autoMultiplier[2] == 1) multiplier2(3);
  if (game.autoMultiplier[3] == 1) multiplier2(4);
  if (game.autoMultiplier[4] == 1) multiplier2(5);
}, 10);