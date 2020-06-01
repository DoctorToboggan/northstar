window.table = document.getElementById("dataTable");
window.tbody = table.getElementsByTagName("tbody")[0];
window.map = document.getElementById("mapSVG");
window.headrow = document.getElementById("data-headers").getElementsByTagName("div");
window.filters = document.getElementById("filters").getElementsByTagName("input");
window.options = {
	'theme' : 'dark',
	'debug' : false,
	'datapath' : { "json" : jsonURL }
};
window.state = {
	'sort' : {'column' : '', 'reverse' : false},
	'filter' : {
		c : {
			q : {},
			l : {}
		},
		p : {
			q : {},
			a : {}
		}
	}
}

document.onLoad = main();

function multiDL(array, f1, f2, k1, k2) {
	if (!array) return;
	if (!array[0]) return;
	if (!k1) k1 = 'n';
	if (!k2) k2 = 'v';
	var ret = document.createElement("dl");
	for (var c1 = 0; c1 < array.length; c1++) {
		var i = array[c1];
		/* i = {k1 : ..., k2 : ...} */
		ret.appendChild( addE('dt', formatVal(i[k1], f1) ) );
		ret.appendChild( addE('dd', formatVal(i[k2], f2) ) );
	}
	return ret;
}

function singleDL(title, val) {
	var ret = document.createElement("dl");
	ret.className = "single";
	ret.appendChild( addE('dt', title) );
	ret.appendChild( addE('dd', val) );
	return ret;	
}

function allIngredients(d) {
	var ret = [];
	for (var c1 = 0; c1 < d.length; c1++) {
		var i = d[c1];
		if (i.n == 'in')
			ret.push(i.v);
	}
	return ret;
}

function allContents(d) {
	var ret = [];
	for (var c1 = 0; c1 < d.length; c1++) {
		var i = d[c1];
		if (i.n == 'co')
			ret.push(i.v);
	}
	return ret;
}

function allGilds(d) {
	var ret = [];
	for (var c1 = 0; c1 < d.length; c1++) {
		var i = d[c1];
		if (i.n == 'is') {
			for (var c2 = 0; c2 < i.v.it.length; c2++) {
				var item = i.v.it[c2];
				ret.push({
					n : item.n,
					v : ''
				});
			}
			if (i.v.le > 0)
				ret.push({
					n : 'Free slot',
					v : (i.v.le == 1 ? '' : ' × ' + i.v.le)
				});
		}
	}
	return ret;
}

function allGildingMods(d) {
	var ret = [];
	for (var c1 = 0; c1 < d.length; c1++) {
		var i = d[c1];
		if (i.n == 'is') {
			for (var c2 = 0; c2 < i.v.it.length; c2++) {
				var itm = i.v.it[c2];
				ret = mergeArrays(ret, itm.v);
			}
		}
	}
	return ret;
}

function allNativeMods(d) {
	var ret = [];
	for (var c1 = 0; c1 < d.length; c1++) {
		var i = d[c1];
		if (i.n == 'at')
			ret = mergeArrays(ret, i.v);
	}
	return ret;
}

function mergeArrays(a, b) { //Merge b into a, for [{n : .., v : ..}] arrays only
	for (var c1 = 0; c1 < b.length; c1++) {
		var j = b[c1];
		let isNew = true;
		for (var c2 = 0; c2 < a.length; c2++) {
			var i = a[c2];
			if (i.n == j.n) {
				i.v += j.v;
				isNew = false;
			}
		}
		if (isNew) 
			a.push({
				n : j.n,
				v : j.v
			});
	}
	return a;
}

function precalcSE(d) {
	return {
		// 'im' : allNativeMods(d),	//[{n : .., v : ..}]
		// 'gm' : allGildingMods(d),	//[{n : .., v : ..}]
		'am' : mergeArrays(allNativeMods(d), allGildingMods(d)),
		'in' : allIngredients(d),	//[{n : .., v : ..}]
		'co' : allContents(d),		//[{n : .., q : ..}]
		'is' : allGilds(d)			//[{n : .., v : ..}]
	};
}

function renderDetails(d) {
	var ret = document.createElement('div');
	var e = [];
	for (var c1 = 0; c1 < d.e.length; c1++) {
		var i = d.e[c1];
		var n = i.n;
		var v = i.v;
		switch(n) {
			case 'us' :
				e.push(singleDL("Uses left", v));
				break;
			case 'ah' :
				e.push(singleDL(v, ''));
				break;
			case 'ex' :
				e.push( addE("h3", "Perishable") );
				e.push( singleDL( "Decay", f2p(v.me) ) );
				if (expDate(v))
					e.push( singleDL("Expiration date", date2string(expDate(v))) );
				break;
			case 'dg' :
				e.push( singleDL( "Hunger increase", f2p(v.inc) ) );
				if (v.min)
					e.push( singleDL("...down to", v.min) );
				break;
			case 'ar' :
				e.push(singleDL("Armor", v.ha + ' / ' + v.sa));
				break;
			case 'wr' :
				e.push(singleDL("Wear", v.dw + ' / ' + v.mw));
				break;
			case 'dm' :
				e.push(singleDL("Damage", v));
				break;
			case 'we' :
				e.push(singleDL("Type", v));
				break;
			case 'ap' :
				e.push(singleDL("AP", f2p(v) ));
				break;
			case 'gr' :
				e.push(singleDL("Grievous", f2p(v) ));
				break;
			case 'sl' : 
				e.push(addE("h3", "As gilding"));
				e.push(multiDL(v, "attrFullName", "sign"));
				break;
			case 'fo' :
				e.push( addE("h3", "FEP") );
				e.push( multiDL(v.ev, "FEPFullName", null) );
				e.push( singleDL("Energy", f2p(v.en)) );
				e.push( singleDL("Hunger", f2p(v.hu)) );
				break;
			case 'ga' :
				e.push( singleDL("Hunger mod", f2p(v.hm)) );
				e.push( singleDL("FEP bonus", f2p(v.fm)) );
				break;
			case 'cu' :
				e.push( singleDL("LP", v.lp) );
				e.push( singleDL("XP", v.xp) );
				e.push( singleDL("Mental weight", v.mw) );
				e.push( singleDL("Time", formatVal(v.tm, 'h2hm')) );
				e.push( singleDL("LP/h", Math.round(v.lp / v.tm * 60)) );
				break;
			case 'cn' : 
				e.push(singleDL("Coinage", v));
				break;
			case 'at' : 
			case 'co' : 
			case 'in' : 
			case 'is' : 
			case 'am' : 
				break;
			default:
				console.log('Unknown field name ' + n);
		}
	}

	for (var k in d.se) {
		var t = d.se[k];
		if(!t[0])
			continue;
		if (k == 'is') {
			e.push( addE('h3', 'Gildings') );
			e.push( multiDL(t) );
		}
		if (k == 'co') {
			e.push( addE('h3', 'Content') );
			e.push( multiDL(t, null, null, 'n', 'q') );
		}
		if (k == 'in') {
			e.push( addE('h3', 'Ingredients') );
			e.push( multiDL(t, null, 'd2pr') );
		}
		if (k == 'am') {
			e.push( addE('h3', 'Attribute modifiers') );
			e.push( multiDL(t, 'attrFullName', 'sign') );
		}
	}

	for (var c1 = 0; c1 < e.length; c1++)
		ret.appendChild(e[c1]);
	return ret;
}

function resetSorted() {
	window.state.sort = {'column' : '', 'reverse' : false};
	for( var i = 0; i < headrow.length; i++)
		headrow[i].className = headrow[i].className.replace(" sorted_reverse", "").replace(" sorted", "");
}

function resetFields() {
	for(var i = 0; i < filters.length; i++)
		if( filters[i].nodeName = "#text" ) filters[i].value = "";
}

function commitSearch() {
	resetSorted();
	setStateFilter();
	refreshView();
}

function setStateFilter() {
	window.state.filter = {
		c : {
			q : {},
			l : {}
		},
		p : {
			q : {},
			a : {}
		}
	}
	for(var i = 0; i < filters.length; i++)
		switch (filters[i].id) {
			case 'filterGoods' :
				window.state.filter.c.n = string2arrays(filters[i].value.trim());
				break;
			case 'filterInfo' : 
				window.state.filter.e = string2arrays(filters[i].value.trim());
				break;
			case 'filterPrice' : 
				window.state.filter.p.n = string2arrays(filters[i].value.trim());
				break;
			case 'filterQmin' : 
				window.state.filter.c.q.min = string2num(filters[i].value);
				break;
			case 'filterQmax' : 
				window.state.filter.c.q.max = string2num(filters[i].value);
				break;
			case 'filterLmin' : 
				window.state.filter.c.l.min = string2num(filters[i].value);
				break;
			case 'filterLmax' : 
				window.state.filter.c.l.max = string2num(filters[i].value);
				break;
			case 'filterPQmin' : 
				window.state.filter.p.q.min = string2num(filters[i].value);
				break;
			case 'filterPQmax' : 
				window.state.filter.p.q.max = string2num(filters[i].value);
				break;
			case 'filterPAMTmin' : 
				window.state.filter.p.a.min = string2num(filters[i].value);
				break;
			case 'filterPAMTmax' : 
				window.state.filter.p.a.max = string2num(filters[i].value);
				break;
		}
}

function renderTable(array) {
	while (tbody.firstChild) 
		tbody.removeChild(tbody.firstChild);
	for (var c1 = 0; c1 < array.length; c1++) {
		var i = array[c1];
		var tmpCN = (i.c.se.co.length == 1) ? i.c.se.co[0].n : commodityToCoinage(i.c);
		var tmpCQ = (i.c.se.co.length == 1) ? i.c.se.co[0].q : i.c.q;
		var dataRow = [
			// labeledIcon(priceToCoinage(i.c), i.c.r, "icon32"),
			labeledIcon(tmpCN, i.c.r, "icon32"),
			(tmpCQ ? Math.round(tmpCQ) : ''),
			i.c.l,
			labeledIcon(priceToCoinage(i.p), i.p.r, "icon32"),
			(i.p.q ? i.p.q : ''),
			i.p.a
		];
	
		var tableRow = document.createElement('tr');
		for (var c2 = 0; c2 < dataRow.length; c2++) {
			var j = dataRow[c2];
			var tableCell = document.createElement('td');
			tableRow.appendChild(tableCell);
			tableCell.innerHTML = j;
		}
		tbody.appendChild(tableRow);

		tableRow.addEventListener("mouseover", highlight);
		tableRow.id = i.id;
	}
}

function refreshView() {
	var searchResults = applyFilter(data);
	applySort(searchResults);
	renderTable(searchResults);

	while (map.firstChild) 
		map.removeChild(map.firstChild);
	mapMarksRegen(data, 'SVGstandInactive');
	mapMarksRegen(searchResults, 'SVGstand');

	document.getElementById("lot-product").innerHTML = '';
	document.getElementById("lot-left").innerHTML = '';
	document.getElementById("lot-price").innerHTML = '';
	document.getElementById("lot-extra").innerHTML = '';
	document.getElementById("lot-details").innerHTML = '';
}

function applyFilter(a) {
	var f = window.state.filter;
	var ret = [];

	for (var c1 = 0; c1 < a.length; c1++) {
		var i = a[c1];
		var visible = true;
		var tmpCQ = (i.c.se.co.length == 1) ? i.c.se.co[0].q : null;

		visible = visible &&
			numberInRange(i.c.q, f.c.q.min, f.c.q.max) &&
			numberInRange(tmpCQ, f.c.q.min, f.c.q.max) &&
			numberInRange(i.c.l, f.c.l.min, f.c.l.max) &&
			numberInRange(i.p.q, f.p.q.min, f.p.q.max) &&
			numberInRange(i.p.a, f.p.a.min, f.p.a.max);

		if (f.c.n) {
			var tmpCN = (i.c.se.co.length == 1) ? i.c.n + i.c.se.co[0].n : priceToCoinage(i.c) + i.c.n;
			visible = visible && 
				wordsInString(f.c.n.include, tmpCN, true) &&
				wordsInString(f.c.n.exclude, tmpCN, false);
		}

		if (f.p.n) {
			var tmpPN = priceToCoinage(i.p) + i.p.n;
			visible = visible &&
				wordsInString(f.p.n.include, tmpPN, true) &&
				wordsInString(f.p.n.exclude, tmpPN, false);
		}

		if (f.e) {
			var tmpE = renderDetails(i.c).innerHTML.toString().replace(/\<.*?\>/g, "");
			if (f.e.include)
				if (f.e.include[0])
					visible = visible && (tmpE.length > 0);
			visible = visible &&
				wordsInString(f.e.include, tmpE, true) &&
				wordsInString(f.e.exclude, tmpE, false);
		}

		if (visible) ret.push(i);
	}
	return ret;
}

function applySort(array) {
	array.sort( function(a, b) {
		var ret = 0;
		switch (window.state.sort.column) {
			case 'sort-cn':
				var tmpCNa = (a.c.se.co.length == 1) ? a.c.se.co[0].n : a.c.n;
				var tmpCNb = (b.c.se.co.length == 1) ? b.c.se.co[0].n : b.c.n;
				ret = tmpCNa.localeCompare(tmpCNb);
				break;
			case 'sort-cq':
				var tmpCQa = (a.c.se.co.length == 1) ? a.c.se.co[0].q : a.c.q;
				var tmpCQb = (b.c.se.co.length == 1) ? b.c.se.co[0].q : b.c.q;
				ret = (tmpCQa ? tmpCQa : 0) - (tmpCQb ? tmpCQb : 0);
				break;
			case 'sort-cl':
				ret = a.c.l - b.c.l;
				break;
			case 'sort-pn':
				ret = a.p.n.localeCompare(b.p.n);
				break;
			case 'sort-pq':
				ret = (a.p.q ? a.p.q : 0) - (b.p.q ? b.p.q : 0);
				break;
			case 'sort-pa':
				ret = a.p.a - b.p.a;
				break;
		}
		return ret * (window.state.sort.reverse ? -1 : 1);
	});
}

function applyTheme() {
	if( window.options.debug ) {
		var debugStyle = document.createElement("link");
		debugStyle.rel = "stylesheet";
		debugStyle.href = "debug.css";
		document.head.appendChild(debugStyle);
	}

	var themeStyle = document.createElement("link");
	themeStyle.rel = "stylesheet";
	themeStyle.href = "theme_" + window.options.theme + ".css";
	document.head.appendChild(themeStyle);
}

function parseQuery() {
	var querystring = window.location.href.split("?")[1];
	if( !querystring ) return;
	if( querystring.length == 0 ) return;

	var pairs = querystring.split("&");
	for( var i = 0; i < pairs.length; i++) 
		window.options[pairs[i].split("=")[0]] = pairs[i].split("=")[1];
}

function resizeDetailsDiv() {
	document.getElementById("lot-details").style.maxHeight = Math.max(64, window.innerHeight-540) + "px";
}

function addDropdownToInput(inputField, list) {
	var currentWidth = inputField.clientWidth;
	var fieldParent = inputField.parentNode;
	
	//adding dropdown button before target input
	var divReferenceButton = document.createElement("div");
	divReferenceButton.className = "dropdownButton";
	divReferenceButton.innerHTML = "+";
	inputField.style.width = currentWidth - 20 + "px";
	inputField.style.paddingLeft = 20 + "px";
	divReferenceButton.addEventListener("click", function () {toggleList(divReferenceList, divReferenceButton);} );
	fieldParent.insertBefore(divReferenceButton, inputField);

	//adding dropdown list to target input
	var divReferenceList = document.createElement("div");
	divReferenceList.div = "listReference";
	divReferenceList.className = "dropdownList";
	divReferenceList.style.display = "none";

	var listsize = 0;
	for( var i in list ) {
		var line = document.createElement("div");
		var text = document.createTextNode(i);
		line.appendChild(text);
		line.addEventListener("click", function() {
			inputField.value = this.innerHTML;
			toggleList(divReferenceList, divReferenceButton);
		})
		divReferenceList.appendChild(line);
		listsize += 1;
	}

	divReferenceList.style.height = listsize*17 + "px";
	fieldParent.insertBefore(divReferenceList, divReferenceButton);
}

function toggleList(list, button) {
	if( list.style.display == "block" ) {
		button.innerHTML = "+";
		list.style.display = "none";
	}
	else {
		list.style.display = "block";
		button.innerHTML = "-";
	}
	return;
}

function loadJSON() {
	var importFrom = window.options.datapath.json;
	var xmlHttpR2 = new XMLHttpRequest();
	xmlHttpR2.onreadystatechange = function() {
		if (this.readyState === 4 && this.status == 200) {
			var tmpObj2 = JSON.parse(this.responseText);
			window.data = tmpObj2.data;
			window.marketInfo = tmpObj2.marketInfo;
			initData(data);
			refreshView();
			document.title = marketInfo.name + ' ' + date2string( new Date( Date.parse(marketInfo.timestamp) ) );
		}
	}
	xmlHttpR2.open("GET", importFrom, true);
	xmlHttpR2.send();
}

function initUI() {
	document.title = "Loading data...";
	parseQuery();
	applyTheme();
	window.addEventListener("keydown", function(event) {
		if (event)
			switch (event.keyCode) {
				case 13 : //Enter
					event.preventDefault();
					commitSearch();
					break;
				default : return;
			}
		});
	document.getElementById("btnReset").addEventListener("click", resetFields);
	document.getElementById("btnSearch").addEventListener("click", commitSearch);
	window.addEventListener("resize", resizeDetailsDiv);
	for (var i = 0; i < headrow.length; i++)
		headrow[i].addEventListener("click", setStateSort);
	resizeDetailsDiv();
	// addDropdownToInput(document.getElementById("filterGoods"), ItemReferenceList);
	// addDropdownToInput(document.getElementById("filterBonuses"), aBonuses);
}

function main() {
	initUI();
	loadJSON();
}

function initData(basearray) { //adds additional info into base data array
	var startCoords = {
		x : basearray[0].b.x,
		y : basearray[0].b.y
	};
	for (var c1 = 0; c1 < basearray.length; c1++) {
		var i = basearray[c1];
		// i.id = basearray.indexOf(i);			//offer id
		i.id = c1;								//offer id
		// i.a = {v : true};						//visibiltiy switch (for filtering)
		i.b.x = (i.b.x - startCoords.x) / 11;	//recalculating BS rc
		i.b.y = (i.b.y - startCoords.y) / 11;
		i.b.id = getBSID(i.b.x, i.b.y);			//barterstand's id number
		i.c.se = precalcSE(i.c.e); 				//precalculate extras summary
	}
}

function setStateSort() {
	var c = window.state.sort.column;
	var r = window.state.sort.reverse;
	resetSorted();
	window.state.sort.column = this.id;
	if (c == this.id)
		window.state.sort.reverse = !r;
	else
		window.state.sort.reverse = false;
	this.className += " sorted" + (window.state.sort.reverse ? "_reverse" : "");
	refreshView();
}

function getBSID(c){
	var ret = -1;
	//...
	//read BSID from ../sample/bsid.js
	//...
	return ret;
}

function highlight() {
	var id = this.id;
	var c = {
		x : data[id].b.x,
		y : data[id].b.y
	};

	var marker = map.getElementById('SVGmarker');
	if (!marker)
		marker = mapAddMark("SVGmarker", rc2s(c));
	marker.setAttribute('cx', rc2s(c).x);
	marker.setAttribute('cy', rc2s(c).y);
		
	detailsToLot(id);
}

function detailsToLot(id){
	var s = data[id];

	var stringProduct = s.c.n + (s.c.q ? ' Q' + s.c.q : '');
	var stringProductLeft = s.c.l + ' left';
	var stringPrice = (priceToCoinage(s.p))
		+ (s.p.q ? ' Q' + s.p.q : '')
		+ (s.p.a ? ' × ' + s.p.a : '');
	var addInfo = 'Barterstand IDN: ' + s.b.id
		+ '<br /> Time: ' + (s.t ? s.t : 'N/A');

	document.getElementById("lot-product").innerHTML = stringProduct;
	document.getElementById("lot-left").innerHTML = stringProductLeft;
	document.getElementById("lot-price").innerHTML = stringPrice;
	document.getElementById("lot-details").innerHTML = ( renderDetails(s.c) ).innerHTML;
	// document.getElementById("lot-extra").innerHTML = addInfo;
}