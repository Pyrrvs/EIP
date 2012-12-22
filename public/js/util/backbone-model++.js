Backbone.Model.prototype.rebind = function(a, b, c, d) {

  this.unbind(a, b, c);
  this.bind(a, b, c);
  if (d)
    b.call(c, this);
};

Backbone.Collection.prototype.rebind = function(a, b, c, d) {

  this.unbind(a, b, c);
  this.bind(a, b, c);
  if (d && a == "add") {
    var self = this;
    this.each(function(model) {
      b.call(c, model, self)
    });
  }
};