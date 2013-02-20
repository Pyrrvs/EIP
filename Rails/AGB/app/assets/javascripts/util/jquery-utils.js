log = console.log.bind(console);

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

    $('select.dropdown, select.dropup').each(function(i, e){
    	var $select = $(e), placeholder = $select.attr("placeholder"), $dropdown = $('<div class="btn-group"></div>'),
    		$btn1 = $('<button class="btn btn-inverse btn-tiny">' + (placeholder != "" ?  placeholder : "none") + '</button>'),
    		$btn2 = $('<button class="btn btn-inverse btn-tiny dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>'),
    		$ul = $('<ul class="dropdown-menu"></ul>');
    	$dropdown.addClass($select[0].className).attr("id", $select.attr("id")).val($select.val());
    	$select.find("option").each(function(i, option) {
    		var $option = $(option), $li = $('<li data-value="' + $option.val() + '"><a>' + $option.text() + '</a></li>');
    		$ul.append($li);
    	});
    	$dropdown.bind("select", function(evt, value) {
    		$(this).val(value).find("button").first().text($(this).find('ul li[data-value="' + value + '"] a').text());
    	});
    	$select.wrap($dropdown).parent().html($btn1).append($btn2).append($ul).on("click", "li", function(evt) {
    		var $dropdown = $(evt.target).parent().parent().parent();
    		$dropdown.trigger("select", $(evt.target).parent().attr("data-value")).trigger("change", evt);
    	});
    });
});
