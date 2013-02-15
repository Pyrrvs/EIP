Backbone.Model.prototype.rebind = function(a, b, c, d) {

  var func = function() {
    var args = arguments;
    setTimeout(function() {
      b.apply(c, args);
    }, 0);
  };

  try {
    this.unbind(a, func);
  } catch (e) {}
  this.bind(a, func);
  if (d)
    func(this, true)
};

Backbone.Collection.prototype.rebind = function(a, b, c, d) {

  var func = function() {
    var args = arguments;
    setTimeout(function() {
      b.apply(c, args);
    }, 0);
  };

  try {
    this.unbind(a, func);
  } catch (e) {}
  this.bind(a, func);
  if (d && a == "add")
    this.each(function(model) {
      func(model, this, true);
    }, this);
};

Backbone.Model.prototype.deepClone = function(cloneUserMembers) {

  var clone = this.clone();
  clone.attributes = $.extend(true, {}, this.attributes);
  if (cloneUserMembers)
    for (var i in this)
      if (!_.has(clone, i))
        clone[i] = this[i];
  for (var i in clone.attributes)
    if (clone.attributes[i] instanceof Backbone.Model)
      clone.attributes[i] = clone.attributes[i].deepClone(cloneUserMembers);
  return (clone);
};

