$(function() {

	$("body").on("keydown", 'input[type="text"]', function(e) {
		if (e.keyCode == 13)
			$(this).trigger("validate");
	});

	$("body").on("click", ".accordion-heading a", function(e) {
		var open = !$(e.target).parent().parent().find(".accordion-body").hasClass("in");
		$(this).parent().trigger(open ? "open" : "close", this);
	});

	$("body").on("click", ".nav-tabs li", function(e) {
		if ($(this).hasClass("disabled"))
			return (false);
	});
});
