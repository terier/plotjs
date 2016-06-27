function Plotjs(options) {
	this.options = $.extend({}, Plotjs.defaults, options);

	this.$element = $(
		'<svg>' +
		'  <g class="plotjs"></g>' +
		'</svg>'
	);
	this.$group = this.$element.find('g');

	this.mouse = {};
	this.mouse.prevX = 0;
	this.mouse.prevY = 0;
	this.attachHandlers();

	this.matrix = Matrix.I(3);
	this.translation = Vector.Zero(2);
	this.rotation = 0;
	this.scaling = $V([1, 1]);
}

Plotjs.defaults = {
	scaleSpeed: 0.002
};

Plotjs.prototype.getElement = function() {
	return this.$element;
};

Plotjs.prototype.getGroup = function() {
	return this.$group;
};

Plotjs.prototype.mouseDown = function(button) {
	return !!this.mouse[button];
};

Plotjs.prototype.getTranslation = function() {
	return this.translation.dup();
};

Plotjs.prototype.setTranslation = function(x) {
	this.translation = x.dup();
	this.updateMatrix();
};

Plotjs.prototype.translate = function(x) {
	this.setTranslation(this.getTranslation().add(x));
};

Plotjs.prototype.getRotation = function() {
	return this.rotation;
};

Plotjs.prototype.setRotation = function(x) {
	this.rotation = x;
	this.updateMatrix();
};

Plotjs.prototype.rotate = function(x) {
	this.setRotation(this.getRotation() + x);
};

Plotjs.prototype.getScaling = function() {
	return this.scaling.dup();
};

Plotjs.prototype.setScaling = function(x) {
	this.scaling = x.dup();
	this.updateMatrix();
};

Plotjs.prototype.scale = function(x) {
	this.setScaling(this.getScaling().map(function(y, i) {
		return y * x.e(i);
	}));
};

Plotjs.prototype.updateMatrix = function() {
	var tr = this.getTranslation();
	var tx = tr.e(1);
	var ty = tr.e(2);
	var T = $M([
		[1, 0, tx],
		[0, 1, ty],
		[0, 0, 1]
	]);

	var ro = this.getRotation();
	var s = Math.sin(ro);
	var c = Math.cos(ro);
	var R = $M([
		[c, -s, 0],
		[s, c, 0],
		[0, 0, 1]
	]);

	var sc = this.getScaling();
	var sx = sc.e(1);
	var sy = sc.e(2);
	var S = $M([
		[sx, 0, 0],
		[0, sy, 0],
		[0, 0, 1]
	]);

	this.matrix = T.x(R).x(S);
	var elements =
		this.matrix.e(1,1) + "," +
		this.matrix.e(2,1) + "," +
		this.matrix.e(1,2) + "," +
		this.matrix.e(2,2) + "," +
		this.matrix.e(1,3) + "," +
		this.matrix.e(2,3);
	this.$group.attr("transform", "matrix(" + elements + ")");
};

Plotjs.prototype.planeToClient = function(x) {
	return this.matrix.x(x);
};

Plotjs.prototype.clientToPlane = function(x) {
	return this.matrix.inv().x(x);
};

Plotjs.prototype.attachHandlers = function() {
	this.$element.on("mousedown", this.onmousedown.bind(this));
	this.$element.on("mouseup", this.onmouseup.bind(this));
	this.$element.on("mousemove", this.onmousemove.bind(this));
	this.$element.on("wheel", this.onwheel.bind(this));
	this.$element.on("contextmenu", false);
};

Plotjs.prototype.onmousedown = function(e) {
	this.mouse[e.which] = true;
	e.preventDefault();
	e.stopPropagation();
};

Plotjs.prototype.onmouseup = function(e) {
	this.mouse[e.which] = false;
	e.preventDefault();
	e.stopPropagation();
};

Plotjs.prototype.onmousemove = function(e) {
	var x = e.clientX;
	var y = e.clientY;
	var prevX = this.mouse.prevX;
	var prevY = this.mouse.prevY;
	var dx = x - prevX;
	var dy = y - prevY;

	if (this.mouseDown(1)) {
		this.translate($V([dx, dy]));
	}
	if (this.mouseDown(3)) {
		var p = this.clientToPlane($V([x, y, 1]));
		console.log(p.e(1), p.e(2), p.e(3));
	}

	this.mouse.prevX = e.clientX;
	this.mouse.prevY = e.clientY;
};

Plotjs.prototype.onwheel = function(e) {
	var w = e.originalEvent.wheelDelta;

	var s = Math.exp(w * this.options.scaleSpeed);
	var S = $V([s, s]);
	this.scale(S);
};
