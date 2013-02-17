Backbone.Model.prototype.rebind = function(a, b, c, d) {

  try {
    this.unbind(a, b, c);
  } catch (e) {}
  this.bind(a, b, c);
  if (d)
    b.call(c, this, true)
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
};

Backbone.Model.prototype.deepClone = function(cloneUserMembers) {

  // pb with cloneUserMembers !
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

