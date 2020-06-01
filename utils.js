function priceToCoinage(priceObject) {
	var ret = null;
	if (priceObject.e)
	for (var c1 = 0; c1 < priceObject.e.length; c1++) {
		var i = priceObject.e[c1];
			if (i.n == 'cn')	
				ret = i.v;
		}
	return (ret ? ret : priceObject.n);
}

function commodityToCoinage(commodityObject) {
	var coinage = null;
	var amount = null;
	if (commodityObject.e)
	for (var c1 = 0; c1 < commodityObject.e.length; c1++) {
		var i = commodityObject.e[c1];
			if (i.n == 'cn')	
				coinage = i.v;
			if (i.n == 'am')	
				amount = i.v;
		}
	return (coinage ? (amount && amount > 1 ? amount + ' ' : '') + coinage + (amount && amount > 1 ? 's' : '') : commodityObject.n);
}

function labeledIcon(label, res, classname) {
	var res1 = (res == 'gfx/invobjs/gems/gemstone') ? 'gfx/invobjs/gems/any' : res;
	return label + '<img class=\"' + classname + '\" src=\"' + (!window.options.debug ? resURL + res1 : 'gfx/blank64.png') + '\" alt=\"' + label + '\"></img>';
}

function rc2s(a) {
	return { 
		x : a.x * modx + offx,
		y : a.y * mody + offy,
	};
}

function f2p(a) {
	return formatVal(a, 'd2pr');
}

function expDate(d) {
	var ret = null;
	var STR = 3.29; //server time ratio
	if (!marketInfo.timestamp || !d.et || !d.st || !d.me) return null;
	var timeLeft = (d.et - d.st) / STR * 1000 * (1 - d.me); //lifetime(s) to realtime(ms)*decaymeter
	var date = new Date( Date.parse(marketInfo.timestamp) + timeLeft);
	return date;
}

function date2string(d) {
	var date = [
		twoDigits( d.getDate() ),
		twoDigits( d.getMonth() + 1 ),
		d.getFullYear()
	];
	var time = [
		twoDigits( d.getHours() ),
		twoDigits( d.getMinutes() )
	];
	return date.join('.') + ' ' + time.join(':');
}

function twoDigits(n){
	return formatVal(n, 'paddedPair');
}

function addE(tag, val) {
	var ret = document.createElement(tag);
	ret.innerHTML = val;
	return ret;
}

function formatVal(val, format) {
	if( !format ) return val;
	switch ( format ) {
		case "paddedPair" : 
			return (val < 10) ? '0' + val : val;
		case "attrFullName" : 
			return (aBonuses[val] ? aBonuses[val] : val);
		case "FEPFullName" : 
			return (aFEP[val] ? aFEP[val] : val);
		case "aztext" : 
			return val.toLowerCase().replace(/[^a-z]/g, "");
		case "sign" : 
			return val > 0 ? "+" + val : val ;
		case "d2pr" : 
			return Math.round(val*10000)/100 + "%";
		case "d2sd" :
			return Math.round(val*100)/100;
		case "2lz" :
			return val.substr(0, 1) + (val.length < 4 ? (val.length < 3 ? "00" : "0") : "") + val.substr(1, val.length-1);
		case "h2hm" :
			var hrs = twoDigits( Math.floor(val/60) );
			var mns = twoDigits( Math.round(val%60) );
			return hrs + ":" + mns;
		default :
			return val;
	}	
}

//filtering helpers

function azContains(a, b){ //if a contains b
	var ta = formatVal(a, "aztext");
	var tb = formatVal(b, "aztext");
	if (tb.length == 0) return true;
	if (ta.length == 0) return false;
	return ta.indexOf( tb ) !== -1;
}

function wordsInString(w, s, b) {
	var ret = b;
	if (w && (w.length >= 0) && s)
		if (b)
			for (var c1 = 0; c1 < w.length; c1++) {
				var t = w[c1];
				ret = ret && azContains(s, t);
			}
		else
			for (var c1 = 0; c1 < w.length; c1++) {
				var t = w[c1];
				ret = ret || azContains(s, t);
			}
	return (ret == b);
}

function numberInRange(n, la, lb) {
	ret = true;
	if (n) {
		if (la)
			if (n < la)
				ret = false;
		if (lb)
			if (n > lb)
				ret = false;
	}
	return ret;
}

function string2arrays(string) {
	if (string.length == 0) return null;
	var inc = [];
	var exc = [];
	var splitArray = string.split(',');
	for (var c1 = 0; c1 < splitArray.length; c1++) {
		var s = splitArray[c1];
		var trimmed = s.trim();
		if (trimmed.indexOf('-') == 0)
			trimmed = trimmed.slice(1);
		if (trimmed.length != 0)
			if (s.trim().indexOf('-') == 0)
				exc.push(trimmed);
			else
				inc.push(trimmed);
	}
	return {
		'include' : inc,
		'exclude' : exc
	};
}

function string2num(string) {
	var ret = parseInt(string);
		if (isNaN(ret))
			ret = null;
	return ret;
}