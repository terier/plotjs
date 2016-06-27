var svgns = "http://www.w3.org/2000/svg";

$(function() {
	var plot = new Plotjs();
	var element = plot.getElement();
	$(document.body).append(element);

	$(window).on("resize", function(e) {
		element.width($(window).width());
		element.height($(window).height());
	}).resize();

	var circle = $(document.createElementNS(svgns, "circle"));
	circle.attr("cx", 10);
	circle.attr("cy", 20);
	circle.attr("r", 10);
	plot.getGroup().append(circle);
});