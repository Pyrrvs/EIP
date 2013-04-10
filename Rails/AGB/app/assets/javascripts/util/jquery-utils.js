log = console.log.bind(console);

_.undef = function(v, value) {

    return (_.isUndefined(v) ? value : v);
}

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

    // create twitter bootstrap dropdown with select
    $('select.dropdown, select.dropup').each(function(i, e){
    	var $select = $(e), placeholder = $select.attr("placeholder") != "" ? $select.attr("placeholder") : "none",
            $dropdown = $('<div data-placeholder="' + placeholder + '" class="btn-group"></div>'),
    		$btn1 = $('<button class="btn btn-inverse btn-tiny">' + placeholder + '</button>'),
    		$btn2 = $('<button class="btn btn-inverse btn-tiny dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>'),
    		$ul = $('<ul class="dropdown-menu"></ul>');
    	$dropdown.addClass($select[0].className).attr("id", $select.attr("id")).val($select.val());
    	$select.find("option").each(function(i, option) {
    		var $option = $(option), $li = $('<li data-value="' + $option.val() + '"><a>' + $option.text() + '</a></li>');
    		$ul.append($li);
    	});
    	$dropdown.bind("select", function(evt, value) {
            var $this = $(this), changed = $this.val != value, text = $this.find('ul li[data-value="' + value + '"] a').text();
    		$this.val(value).find("button").first().text(text == "" ? $this.attr("data-placeholder") : text);
            if (changed) $this.trigger("change", evt);
    	});
    	$select.wrap($dropdown).parent().html($btn1).append($btn2).append($ul).on("click", "li", function(evt) {
    		var $dropdown = $(evt.target).parent().parent().parent();
    		$dropdown.trigger("select", $(evt.target).parent().attr("data-value"));
    	});
    });

    // patch bootstrap collapse firefox (removes transitions)
    $("body").on('click', ".accordion-toggle", function(e) {
        e.stopPropagation();
        var $el = $(e.target), $body = $el.parent().next(), to_open = !$body.hasClass("in"), $acc = $el.closest(".accordion-group");
        ($acc.parent("accordion").length ? $acc.parent("accordion") : $acc)
            .find(".accordion-body.in").removeClass("in").parent().find(".accordion-heading").trigger("kclose");
        if (to_open) $body.addClass("in").parent().find(".accordion-heading").trigger("kopen");
        return false;
    });
});
