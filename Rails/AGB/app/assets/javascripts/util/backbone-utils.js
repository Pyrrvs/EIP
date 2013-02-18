Backbone.Model.prototype.rebind = function(a, b, c, d) {

  try {
    this.unbind(a, b, c);
  } catch (e) {}
  this.bind(a, b, c);
  if (d)
    b.call(c, this, true)
  return (this);
};

Backbone.Model.prototype.deepClone = function() {

  var clone = this.clone();
  clone.attributes = $.extend(true, {}, this.attributes);
  for (var i in clone.attributes)
    if (clone.attributes[i] instanceof Backbone.Model || clone.attributes[i] instanceof Backbone.Collection)
      clone.attributes[i] = clone.attributes[i].deepClone();
  return (clone);
};

Backbone.Collection.prototype.rebind = function(a, b, c, d) {

  try {
    this.unbind(a, b, c);
  } catch (e) {}
  this.bind(a, b, c);
  if (d && a == "add")
    this.each(function(model) {
      b.call(c, model, this, true);
    }, this);
  return (this);
};

Backbone.Collection.prototype.cleanup = function(func, obj) {

  this.each(function(model) {
    func.call(obj, model, this);
  });
  return (this);
};

Backbone.Collection.prototype.clear = function() {

  while (this.length > 0)
    this.remove(this.at(0));
  return (this);
};

Backbone.Collection.prototype.concat = function(collection) {

  collection.each(function(model) {
    this.push(model);
  }, this);
  return (this);
};

Backbone.Collection.prototype.deepClone = function() {

  var clone = this.clone();
  for (var i in clone.models)
    clone.models[i] = clone.models[i].deepClone();
  return (clone);
};