Function.prototype.async = function(timeout) {

  var funcToAsync = this;
  return (function() {
    var args = arguments, self = this;
    setTimeout(function() {
      funcToAsync.apply(self, args);
    }, timeout)
  })
}

Function.prototype.asyncCall = function() {

	this.async().apply(this, arguments);
}

Function.prototype.asyncCallBind = function() {

	this.async().apply(arguments[0], Array.prototype.shift(arguments));
}

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

	$("body").on("click", ".tab", function(e) {

		var nameClass = "." + $(e.target).attr("name");

		$(nameClass).hide().parent().find(nameClass + '[data-type="' + $(e.target).data("type") + '"]').show().trigger("change");
	});

	$("body").on("change", 'input[type="number"]', function(e) {

		if (_.isNaN(parseInt($(e.target).val())))
			$(e.target).val(0);
	});
});
