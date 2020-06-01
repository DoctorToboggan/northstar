function mapMarksRegen(array, classname) {
	var existing = document.getElementsByClassName(classname);
	for (var i = 0; i < existing.length; i++)
		map.removeChild(existing[i]);
	var standIcons = [];
	for (var i = 0; i < array.length; i++) {
		var standIcon = {
			x : array[i].b.x,
			y : array[i].b.y
		}
		var isNew = true;
		for (var j = 0; j < standIcons.length; j++) {
			if (
				(standIcons[j].x == standIcon.x)
				 &&
				(standIcons[j].y == standIcon.y)
			)
				isNew = false;
		}
		if (isNew) 
			standIcons.push(standIcon);
	}

	for (var i = 0; i < standIcons.length; i++)
		mapAddMark(classname, rc2s(standIcons[i]));
}

function mapAddMark(type, c) {
	var ns = "http://www.w3.org/2000/svg";
	switch (type) {
		case "SVGmarker" : 
			var mark = document.createElementNS(ns, 'circle');
			mark.setAttribute('cx', c.x);
			mark.setAttribute('cy', c.y);
			mark.setAttribute('r', 5);
			mark.setAttribute('id', 'SVGmarker');
			mark.setAttribute('stroke-opacity', 0.85);
			break;
		case "SVGstand" : 
			var r = 2.5;
			var mark = document.createElementNS(ns, 'rect');
			mark.setAttribute('x', Math.round(c.x-r));
			mark.setAttribute('y', Math.round(c.y-r));
			mark.setAttribute('width', r*2);
			mark.setAttribute('height', r*2);
			break;
		case "SVGstandInactive" : 
			var r = 1.5;
			var mark = document.createElementNS(ns, 'rect');
			mark.setAttribute('x', Math.round(c.x-r));
			mark.setAttribute('y', Math.round(c.y-r));
			mark.setAttribute('width', r*2);
			mark.setAttribute('height', r*2);
			break;
		default:  console.log(type);
			return;
	}
	mark.setAttribute('class', type);
	map.appendChild(mark);
	return mark;
}