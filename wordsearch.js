var isMobile = (navigator.userAgent.match(/iPad|iPhone|android/i) != null);

$(document).ready(init);

//Customizable options =======================================
var grid = {
	x: 11,
	y: 17
};
var wordlist = [
	"react",
	"angular",
	"routing",
	"scope",
	"json",
	"ajax",
	"svg",
	"functional",
	"canvas",
	"cookies",
	"webpack",
	"node",
	"github",
	"backbone",
	"jquery",
	"gulp",
	"grunt",
	"javascript",
	"async",
	"defer",
	"promise",
	"callback",
	"immutable",
	"prototype",
	"closure",
	"console",
	"redux"
];
//============================================================

var alphabet = "abcdefghijklmnopqrstuvwxyz";
var words = [];

// GAME CYCLE ===================================================

function init() {
	words = [];
	$("#wordlist").hide().html("<div class='big-word'>Words to find:</div>");
	$("#frame").html("").addClass("loading");
	drawGrid();
	setTimeout("placeWords()", 500);
}

function placeWords() {
	for (var i in wordlist) {
		var w = new Word(wordlist[i], i);
		words.push(w);
		if (w.valid) $("#wordlist").append("<div class='word word-" + i + "'>" + wordlist[i] + "</div>");
	}
	$("#frame").removeClass("loading");
	$(".grid-item").css("visibility", "visible");
	$("#wordlist").fadeIn("slow");
}

function gameOver() {
	alert("Puzzle Complete!");
}

// DRAWING ===================================================

function drawGrid() {
	for (var y = 0; y < grid.y; y++) {
		var newGridRow = $("<div class='grid-row grid-row-" + y + "'></div>");
		for (var x = 0; x < grid.x; x++) {
			var newGridItem = $("<div unselectable='on' id='grid-item-" + x + "-" + y + "' class='noselect grid-item grid-row-item-" + x + " grid-item-" + x + "-" + y + "'></div>");
			newGridItem.html(ml(alphabet.charAt(Math.random() * 26)));
			newGridItem.css("visibility", "hidden");
			newGridRow.append(newGridItem);
		}
		newGridRow.append("<div class='anchor'></div>");
		$("#frame").append(newGridRow);
	}
	$(".grid-item").each(addListeners);
	if (isMobile) {
		var o = document.getElementById("frame");
		o.ontouchstart = onGridItemTouchStart;
		o.ontouchend = onGridItemTouchEnd;
		o.ontouchmove = onGridItemTouchMove;
	}
	$("#frame").append("<div class='anchor'></div>");
}

//highlight a line of boxes
function drawGridLine(start, end) {
	var x0 = parseInt(start.x);
	var y0 = parseInt(start.y);
	var x1 = parseInt(end.x);
	var y1 = parseInt(end.y);

	var dx = Math.abs(x1 - x0)
	var dy = Math.abs(y1 - y0)
	var sx = (x0 < x1) ? 1 : -1;
	var sy = (y0 < y1) ? 1 : -1;
	var err = dx - dy;
	selection.dist = 0;
	while (true) {
		selection.dist++;
		gi(x0, y0).addClass("highlighted");
		if (x0 == x1 && y0 == y1) break;
		var e2 = 2 * err;
		if (e2 > -dy) {
			err -= dy;
			x0 += sx;
		}
		if (e2 < dx) {
			err += dx;
			y0 += sy;
		}
	}
}


// EVENTS ===================================================
var selection = false;
//Touch Event Listeners
function onGridItemTouchStart(evt) {
	var e = evt.touches[0];
	var gridItem = gic(e.pageX, e.pageY);
	gridItem.addClass("highlighted");
	var parts = gridItem.attr("id").toString().split("-");
	selection = {
		dist: 0
	};
	selection.start = {
		item: gridItem,
		x: parts[2],
		y: parts[3]
	};

	evt.preventDefault();
	return false;
}

function onGridItemTouchMove(evt) {
	if (selection == false) return;
	var e = evt.touches[0];
	var gridItem = gic(e.pageX, e.pageY);
	var parts = gridItem.attr("id").toString().split("-");
	selection.current = {
		item: gridItem,
		x: parts[2],
		y: parts[3]
	};
	$(".highlighted").removeClass("highlighted");
	drawGridLine(selection.start, selection.current);

	evt.preventDefault();
	return false;
}

function onGridItemTouchEnd(evt) {
	var e = evt.touches[0];
	var allSolved = true;
	for (var i in words) {
		if (words[i].check() && selection.dist == words[i].len) words[i].solve();
		if (!words[i].solved) allSolved = false;
	}
	selection = false;
	$(".highlighted").removeClass("highlighted");
	if (allSolved) gameOver();

	evt.preventDefault();
	return false;
}
//Mouse Event Listeners
function onGridItemMouseDown(e) {
	var gridItem = $(this);
	gridItem.addClass("highlighted");
	var parts = gridItem.attr("id").toString().split("-");
	selection = {
		dist: 0
	};
	selection.start = {
		item: gridItem,
		x: parts[2],
		y: parts[3]
	};
}

function onGridItemMouseUp(e) {
	var allSolved = true;
	for (var i in words) {
		if (words[i].check() && selection.dist == words[i].len) words[i].solve();
		if (!words[i].solved) allSolved = false;
	}
	selection = false;
	$(".highlighted").removeClass("highlighted");
	if (allSolved) gameOver();
}

function onGridItemMouseOver(e) {
	if (selection == false) return;
	var gridItem = $(this);
	var parts = gridItem.attr("id").toString().split("-");
	selection.current = {
		item: gridItem,
		x: parts[2],
		y: parts[3]
	};
	$(".highlighted").removeClass("highlighted");
	drawGridLine(selection.start, selection.current);
}

// CLASSES ==================================================

function Word(newWord, id) {
	this.content = newWord;
	this.coords = [];
	this.id = id;
	this.solved = false;
	this.check = function() {
		for (var i in this.coords) {
			if (!this.coords[i].hasClass("highlighted")) return false;
		}
		return true;
	}
	this.solve = function() {
		$(".word-" + this.id).addClass("solved");
		for (var i in this.coords) this.coords[i].addClass("solved").addClass(this.solveClass);;
		this.solved = true;
	}
	this.place = place;
	this.len = newWord.length;
	this.minx = 0;
	this.miny = 0;
	this.maxx = grid.x;
	this.maxy = grid.y;
	//Constructor code
	var dir = Math.floor(Math.random() * 4);
	if (dir < 1) {
		this.addx = function(x, i) {
			return x + i;
		};
		this.addy = function(y, i) {
			return y - i;
		};
		this.maxx = grid.x - this.len;
		this.miny = this.len;
		this.dir = "/";
		this.solveClass = "da";
	} else if (dir < 2) {
		this.addx = function(x, i) {
			return x + i;
		};
		this.addy = function(y, i) {
			return y + i;
		};
		this.maxx = grid.x - this.len;
		this.maxy = grid.y - this.len;
		this.dir = "\\";
		this.solveClass = "dd";
	} else if (dir < 3) {
		this.addx = function(x, i) {
			return x;
		};
		this.addy = function(y, i) {
			return y + i;
		};
		this.maxx = grid.x;
		this.maxy = grid.y - this.len;
		this.dir = "|"
		this.solveClass = "v";
	} else {
		this.addx = function(x, i) {
			return x + i;
		};
		this.addy = function(y, i) {
			return y;
		};
		this.maxx = grid.x - this.len;
		this.maxy = grid.y;
		this.dir = "-";
		this.solveClass = "h";
	}

	this.valid = this.place();
}

// HELPERS ==================================================

function addListeners() {
	if (isMobile) return;
	$(this).mousedown(onGridItemMouseDown);
	$(this).mouseup(onGridItemMouseUp);
	$(this).mouseover(onGridItemMouseOver);
}

function place() {
	var o = this;
	var x, y;
	var valid = false;
	var reverse = Math.round(Math.random() * .9) == 0;
	var timeout = 0;
	while (!valid) {
		x = o.minx + Math.floor(Math.random() * (o.maxx - o.minx));
		y = o.miny + Math.floor(Math.random() * (o.maxy - o.miny));
		valid = true;
		//log("  looking to place",o.content.charAt(i),"at",x,y)
		for (var i = 0; i < o.len; i++) {
			var item = gi(o.addx(x, i), o.addy(y, i));
			//log("    checking",o.addx(x,i),o.addy(y,i),"hasClass:",item.hasClass('used'),"content:",item.find(".letter").html())
			var c = (!reverse) ? o.content.charAt(i) : o.content.charAt(o.len - (i + 1));
			if (item.find(".letter").html() != c && item.hasClass('used')) valid = false;
		}
		if (timeout++ > 1000) {
			//setTimeout("init()",50);
			log(" !! Can't fit " + o.content)
			return false;
		}
	}
	//draw words
	for (var i = 0; i < o.len; i++) {
		var item = gi(o.addx(x, i), o.addy(y, i));
		var c = (!reverse) ? o.content.charAt(i) : o.content.charAt(o.len - (i + 1));
		item.html(ml(c));
		item.addClass("used");
		o.coords.push(item);
		//log("  setting",x+i,y+i,"to",o.content.charAt(i).toUpperCase(),item);
	}
	//log(o.dir,o.content,"placed at",x+","+y,(reverse)?"(r)":"");
	return true;
}

function log() {
	var args = Array.prototype.slice.call(arguments);
	//args.unshift('log');
	try {
		console.log(args.join(" "));
	} catch (e) {}
}

//Get grid item
function gi(x, y) {
	return $(".grid-item-" + x + "-" + y);
}
//get grid item by coordinates
function gic(x, y) {
	var c = $("#frame").offset();
	var x = Math.floor((x - c.left) / ($(".grid-item").width() + 2));
	var y = Math.floor((y - c.top) / ($(".grid-item").height() + 2));
	return gi(x, y);
}
//make letter
function ml(letter) {
	return "<div unselectable='on' class='letter noselect'>" + letter.toUpperCase() + "</div>";
}

function inspect(o) {
	var res = o + " { ";
	for (var i in o) res += i + ":" + o[i] + " ";
	return res + "}";
}