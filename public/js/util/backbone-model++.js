NestedModel = Backbone.Model.extend({

  ___getAttr : function(attrs, attr) {

    var attr = attr.split(".");

    for (var i in attr)
      attrs = attrs[attr[i]];
    return (attrs);
  },

  ___has : function(obj, attr) {

    var attr = attr.split(".");

    for (var i in attr) {
      if (!_.has(attrs, attr[i]))
        return (false);
      attrs = attrs[attr[i]];
    }
    return (true);
  },

   set: function(key, value, options) {
      var attrs, attr, val, old;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }

      // Extract attributes and options.
      options || (options = {});
      if (!attrs) return this;
      if (attrs instanceof Backbone.Model) attrs = attrs.attributes;
      if (options.unset) for (attr in attrs) attrs[attr] = void 0;

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      var changes = options.changes = {};
      var now = this.attributes;
      var escaped = this._escapedAttributes;
      var prev = this._previousAttributes || {};

      // For each `set` attribute...
      for (attr in attrs) {
        val = this.___getAttr(attrs, attr);
        old = this.___getAttr(now, attr);
        console.log(val, old);

        // If the new and current value differ, record the change.
        if (!_.isEqual(old, val) || (options.unset && this.___has(now, attr))) {
          delete escaped[attr];
          (options.silent ? this._silent : changes)[attr] = true;
        }

        // Update or delete the current value.
        options.unset ? delete now[attr] : now[attr] = val;

        // If the new and previous value differ, record the change.  If not,
        // then remove changes for this attribute.
        if (!_.isEqual(prev[attr], val) || (_.has(now, attr) != _.has(prev, attr))) {
          this.changed[attr] = val;
          if (!options.silent) this._pending[attr] = true;
        } else {
          delete this.changed[attr];
          delete this._pending[attr];
        }
      }

      // Fire the `"change"` events.
      if (!options.silent) this.change(options);
      return this;
    },
});