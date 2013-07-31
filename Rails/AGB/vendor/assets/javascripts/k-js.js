log = console ? console.log.bind(console) : $.noop

$(function() {
	$("body").css("visibility", "visible").hide().fadeIn(200)
});

_.mixin({

	undef: _.isUndefined,
	number: _.isNumber,
	func: _.isFunction,
	object: _.isObject,
	array: _.isArray,
	string: _.isString,

	array_to_get_params: function(name, array) {
		return name + array.join('&' + name + '[]=')
	},

	omit_if: function(obj, func) {
		obj2 = {}
		for (var i in obj)
			if (!func(obj[i], i, obj))
				obj2[i] = obj[i]
		return obj2
	},

	deep_extend: function(obj1, obj2, pred) {
		var v = null
		for (var i in obj2)
			if (!pred || pred(obj2, i)) {
				v = obj2[i]
				if (_.array(v))
					obj1[i] = _.deep_extend(_.array(obj1[i]) ? obj1[i] : [], v, pred)
				if (_.object(v))
					obj1[i] = _.deep_extend(_.object(obj1[i]) ? obj1[i] : {}, v, pred)
				else
					obj1[i] = v
			}
		return obj1
	},

	$find: function($el, selector) {
		var $e = $el.find(selector)
		return $e.length ? $e : $(selector)
	},

	$each: function($els, func) {
		$els.each(function(i, e) { return func.call($(e), i, e) })
	},

	$parent: function($el, pred) {
		$e = null
		_($el.parents()).$each(function() {
			if (!$e && pred.call(this, this))
				$e = this
		});
		return $e
	},

	try: function(cond, val1, val2) {
		return cond ? val1 : val2
	},

	what: function(cond, val1, val2) {
		return cond ? val1 : val2
	},

	parent: function(root, child, children_name) {
		var parent = null;
		children_name = _(children_name).let("children");
		_.tree(root, children_name, function(node) {
			if (_.findWhere(node[children_name], child))
				return (parent = node);
			return (false);
		})
		return (parent);
	},

	tree: function(node, children_name, func) {
		if (_.undef(func))
			func = children_name
			children_name = "children"
		if (func(node))
			return true
		var children = node[children_name];
		for (child in children)
			if (_.tree(children[child], func))
				return true
		return false
	},

	pxToInt: function(px) {
		return (+(px.substr(0, px.length - 2)))
	},

	// update
	$width: function(e) {
		return (e.width() + _.pxToInt(e.css("marginLeft")) + _.pxToInt(e.css("marginRight")) + _.pxToInt(e.css("paddingLeft"))
			 + _.pxToInt(e.css("paddingRight")) + _.pxToInt(e.css("borderLeftWidth")) + _.pxToInt(e.css("borderRightWidth")));
	},

	// update
	$height: function(e) {
		return (e.height() + _.pxToInt(e.css("paddingTop")) + _.pxToInt(e.css("paddingBottom")) +
			_.pxToInt(e.css("borderTopWidth")) + _.pxToInt(e.css("borderBottomWidth")));
	},

	let: function(v1, v2) {
		return _.isUndefined(v1) ? v2 : v1
	},

	set: function(obj, prop, val) {
		obj[prop] = val
		return obj
	},

// COLLECTION

	uniqueness: _.findWhere,
	presence: _.findWhere,

	validate: function(coll, elem, prop, options) {
		result = _(options).array() ? _(options).fold({}, function(mem, opt) { return _(mem).set(opt, true) }) : _({}).set(options, true)
		if (_(result).has('uniqueness') && _(coll).find_where(_(elem).pick(prop)))
			result['uniqueness'] = false
		return result
	},

	is_first: function(coll, elem) {
		return coll[0] == elem
	},

	is_last: function(coll, elem) {
		return _(coll).last() == elem
	},

	diff: function(a1, a2) {
		var e = null, res = {more: [], less: []}
		_(a1).each(function(e) {
			if (!_(a2).find_where({name: e.name}))
				res.more.push(e)
		});
		_(a2).each(function(e) {
			if (!_(a1).find_where({name: e.name}))
				res.less.push(e)
		});
		return res
	},

	fold: function(list, mem, iterator) {
		return _.reduce(list, iterator, mem)
	},

	match_where: function(obj1, obj2) {
		for (var i in obj2)
			if (obj1[i] != obj2[i])
				return false;
		return true;
	},

	find_if: function(coll, iterator) {
		for (var i in coll)
			if (iterator(coll[i], i, coll))
				return (coll[i])
		return undefined
	},

	filter_where: function(coll, prop) {
		var res = [];
		for (var i in coll)
			if (_.match_where(coll[i], prop))
				res.push(coll[i]);
		return res;
	},

	uniq_where: function(coll, prop_name) {
		var res = [];
		for (var i in coll)
			if (!_.find_where(res, _.pick(coll[i], prop_name)))
				res.push(coll[i]);
		return res
	},

	// doesnt work if you want to remove from array of array
	remove: function(coll, array) {
		return _.isArray(array) ? _.without.apply(_, [coll].concat(array)) : _.without.apply(_, arguments)
	},

	remove_where: function(coll, prop) {
		var res = [];
		for (var i in coll)
			if (!_.match_where(coll[i], prop))
				res.push(coll[i]);
		return res;
	},

	// const pop
	pop: function(coll, idx) {
		return (_.string(coll) ? coll.substr(0, coll.length - 1) : _.without(coll, coll[idx]));
	},

	get: function(coll, i) {
		return coll[i]
	},

	find_where: _.findWhere,

	sort_by: function(coll, iterator) {
		return _.isString(iterator) ? _.sortBy(coll, function(e) { return e[iterator] }) : _.sortBy(coll, iterator)
	},

// !COLLECTION

// ARRAY

	concat: function(a1, a2) {
		return Array.prototype.concat(a1, a2);
	},

	next: function(array, e) {
		return e ? array[_(array.indexOf(e) + 1).mod(array.length)] : array[0]
	},

	prev: function(array, e) {
		return e ? array[_(array.indexOf(e) - 1).mod(array.length)] : array[0]
	},

// !ARRAY

// RANDOM

	rand_bool: function() {
		return Math.random() > 0.5
	},

	rand_between: function(min, max) {
		return Math.round(Math.random() * (max - min - 1) + min)
	},

// !RANDOM

// NUMBER

	between: function(n, min, max) {
		return (n < min ? min : (n > max ? max : n))
	},

	mod: function(v, n) {
		return v < 0 ? n - 1 : v % n
	},

	round: Math.round,

// !NUMBER

// STRING

	blank: function(str) {
		for (var i in str)
			if (str[i] != ' ')
				return false
		return true
	},

	indexOf: function(str, regex, startpos) {
		var indexOf = str.substring(startpos || 0).search(regex);
		return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
	},

	lastIndexOf: function(str, regex, startpos) {
		startpos = startpos || str.length
		var stringToWorkWith = str.substring(0, startpos + 1), lastIndexOf = -1, nextStop = 0;
		while (result = regex.exec(stringToWorkWith)) {
	    lastIndexOf = result.index;
	    regex.lastIndex = ++nextStop;
		}
		return lastIndexOf;
	},

	epur_str: function(str) {
		return str.replace(/\s+/g, ' ').replace(/^\s*|\s*$/g, '')
	},

	capitalize: function(str) {
		return str.charAt(0).toUpperCase() + str.substr(1)
	},

	substrAt: function(str, sub) {
		return (str.substr(str.indexOf(sub) + sub.length))
	},

	substrAtIdx: function(str, sub) {
		return (str.substr(str.indexOf(sub)))
	},

	substrBefore: function(str, sub) {
		return (str.substr(0, str.indexOf(sub)))
	},

	substrAfter: function(str, sub) {
		return (str.substr(0, str.indexOf(sub) + sub.length))
	},

	normalize: function(str) {
		return str.replace('_', ' ')
	},

	pluralize: function(str, bool, plural) {
		return (_(bool).number() ? bool > 1 : bool) ? (plural || str + 's') : str
	},

// !STRING
})
