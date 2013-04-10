function TestError(string, err, line) {

	this.string = string;
	this.line = line;
	this.err = err;
	this.dead = false;
}

TestError.prototype.log = function(test) {

	console.log("\n  test", test.text, "failed!\n\n   ", this.string,
		"within scope {", test.scope.selector, "} failed!", this.err, "\n    ======>", this.line);
};

function Test(text) {

	this.text = text;
	this.scope = $("body");
	this.within_scope = [];
	this.$el = null;
}

Test.prototype.get = function(selector) {

	return (this.scope.find(selector));
};

Test.prototype.try = function() {

	var $el = null;
	for (var i in arguments)
		if (($el = this.get(arguments[i])).size())
			return ($el.first());
	return (null);
};

var __orig_setTimeout = setTimeout;

var __nb_test = 0, __nb_test_fail = 0, __log = "", __nb_timeout = 0;
var __call_stack = [], __current_test = null;

setTimeout = function(func, timer) {

	++__nb_timeout;
	__orig_setTimeout(function() {
		func.apply(this, arguments);
		if (!--__nb_timeout)
			__next_test();
	}, timer);
}

function new_test(obj) {

	for (var i in obj) {
		if (typeof obj[i] == "Function")
			window["_test_" + i] = obj[i];
		else
			window["_test_" + i] = (function(func) { return function() {
				eval(func + "");
			}})(obj[i]);
		window[i] = (function(name, j) { return function () {
			var func = function() {
				if (this.dead)
					return;
				__current_test = this;
				try {
					window[j].apply(this, arguments);
				} catch (e) {
					if (e instanceof TestError) {
						var err = __get_err().stack;
						err = err.substr(err.indexOf("at Test.<anonymous> (") + "at Test.<anonymous> (".length);
						err = err.substr(0, err.indexOf(")\n"));
						if (!e.line)
							e = new TestError(name + "(" + Array.prototype.join.call(arguments, ", ") + ")",
								"(" + (e.string || "not found") + ")", err);
					}
					throw e;
				}
			};
		var array = [__current_test];
		for (var i in arguments)
			array.push(arguments[i])
		__call_stack.push(func.bind.apply(func, array));
		}})(i, "_test_" + i);
	}
}

new_test({

	click_button : function(selector) {

		if (!(this.$el = this.try("button, " + selector, ".btn " + selector)))
			throw new TestError;
		this.$el.click();
	},

	check_content : function(content) {

		if (!~this.scope.contents("*").text().indexOf(content))
			throw new TestError("content not found");
	},

	not_check_content : function(content) {

		if (~this.scope.contents("*").text().indexOf(content))
			throw new TestError("content exists");
	},

	check_value : function(selector, value) {

		if (!(this.$el = this.try(selector)))
			throw new TestError;
		else if (this.$el.val() != value)
			throw new TestError("expected " + value + " get " + this.$el.val());
	},

	not_check_value : function(selector, value) {

		if (!(this.$el = this.try(selector)))
			throw new TestError;
		else if (this.$el.val() == value)
			throw new TestError("equals");
	},

	begin_within : function(selector) {

		this.within_scope.push(this.scope);
		if (!(this.scope = this.scope.find(selector)))
			throw new TestError;
	},

	end_within : function() {

		this.scope = this.within_scope.pop();
	},

	fill_in : function(selector, value) {

		if (!(this.$el = this.try(selector)))
			throw new TestError;
		this.$el.val(value);
	},
});

function __get_err(){
    try { throw Error('') } catch(err) { return err; }
}

function it(text) {

	++__nb_test;
	__current_test = new Test(text);
	__log += ".";
}

function __next_test() {

	if (!__call_stack.length)
		return;
	while (!__nb_timeout && __call_stack.length) {
		try {
			__call_stack[0]();
		} catch (e) {
			++__nb_test_fail;
			__log += "F";
			if (e instanceof TestError)
				e.log(__current_test);
			else
				throw e;
			__current_test.dead = true;			
		}
		__call_stack.shift();
	}
	if (!__call_stack.length) {
		console.log("\n", __log, " -> ", __nb_test_fail + "/" + __nb_test, "failed! (" + __log.split("").map(function(e, i) {
			return (e == 'F' ? i + 1 : -1);
		}).filter(function(e, i) {
			return (e != -1);
		}).join(", ") + ")");
	}
}

function begin_test(func) {

	__log = "";
	__nb_test = 0;
	__nb_test_fail = 0;
	__nb_timeout = 0;
}

function end_test() {

	console.log("Starting all tests.");
	__next_test();
}