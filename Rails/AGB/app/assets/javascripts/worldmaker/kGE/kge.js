define([], function() {

	// Box2DWeb migration
	// (function(obj, n) {
	// 	if (n > 4) return;
	// 	for (var i in obj)
	// 		if (i.substring(0, 2) == "b2")
	// 			window[i] = obj[i];
	// 		else
	// 			arguments.callee(obj[i], ++n);
	// })(Box2D, 0);
	// b2Shape.e_circleShape = 0;
	// b2Shape.e_polygonShape = 1;
	// b2CircleShape.prototype.GetType = function() {
	// 	return (b2Shape.e_circleShape);
	// }
	// b2PolygonShape.prototype.GetType = function() {
	// 	return (b2Shape.e_polygonShape);
	// }

	CanvasRenderingContext2D.prototype.lineTov = function(v) {

		this.lineTo(v.x, v.y);
	}

	CanvasRenderingContext2D.prototype.moveTov = function(v) {

		this.moveTo(v.x, v.y);
	}

	function DynamicScene(worldScaling) {

	    DynamicScene.superclass.constructor.call(this);
	    this.worldScaling = worldScaling;
		this.world = new b2World(new b2Vec2(0, -10), true);
	}

	DynamicScene.inherit(cc.Scene, {

		world : null,
		layer : null,
		worldScaling : null,

		update : function(dt) {

	        this.world.Step(dt, 10, 10);
	        this.world.ClearForces();
	        this.children.forEach(function(layer) {
				layer.children.forEach(function(entity) {
		            if (entity.body) {
		                entity.position = cc.Point.scale(entity.body.GetPosition(), this.worldScaling);
			            entity.rotation = cc.radiansToDegrees(-entity.body.GetAngle());
			        }
		        }.bind(this));
			}.bind(this));
			if (this.debug)
				this.world.DrawDebugData();
		}
	});

	function Entity(settings) {

		Entity.superclass.constructor.call(this, settings);
	};

	Entity.inherit(cc.Sprite, {

		body : null,

		setUrl : function(url) {

			if (!url || url == "") {
				this.textureAtlas = null;
        this.rect = new cc.Rect(0, 0, 0, 0);
	    } else {
	      this.textureAtlas = new cc.TextureAtlas({ url : url });
        cc.addListener(this.textureAtlas, 'load', function () {
          this.rect = new cc.Rect(0, 0, this.textureAtlas.texture.size.width, this.textureAtlas.texture.size.height)
        }.bind(this));
	    }
		},

		cleanup : function() {

			if (this.body && this.parent)
				this.parent.parent.world.DestroyBody(this.body);
			Entity.superclass.cleanup.call(this);
		}
	});

	Point = {

		set : function(x, y) {

			this.x = x;
			this.y = y;
			return (this);
		},

		add : function(v) {

			this.x += v.x;
			this.y += v.y;
			return (this);
		},

		sub : function(v) {

			this.x -= v.x;
			this.y -= v.y;
			return (this);
		},

		scale : function(value) {

			if (value instanceof cc.Point) {
				this.x *= value.x;
				this.y *= value.y;
			} else {
				this.x *= value;
				this.y *= value;
			}
			return (this);
		},

		dot : function(v) {

			return (this.x * v.x + this.y * v.y);
		},

		cross : function(v) {

			return (this.x * v.y - this.y * v.x);
		},

		norm : function() {

			return (Math.sqrt(this.dot(this)));
		},

		dist : function(v) {

			var dx = v.x - this.x, dy = v.y - this.y;

			return (Math.sqrt(dx * dx + dy * dy));
		},

		normalize : function() {

			var n = this.norm();

			this.x /= n;
			this.y /= n;
			return (this);
		},

		angle : function(v) {

			var angle = cc.radiansToDegrees(Math.acos(this.dot(v) / (this.norm() * v.norm())));
			if (_.isNaN(angle))
				return (0);
			if (this.cross(v) < 0)
				return (-angle);
			return (angle);
		},

		limit : function(value) {

			var norm = this.norm();

			this.x = this.x / norm * value;
			this.y = this.y / norm * value;
			return (this);
		},

		// copy : function(v) {

		// 	this.x = v.x;
		// 	this.y = v.y;
		// 	return (this);
		// },

		clone : function() {

			return (cc.ccp(this.x, this.y));
		},

		nullifie : function() {

			this.x = this.y = 0.0;
			return (this);
		},

		isNull : function() {

			return (!this.x && !this.y);
		},

		toString : function() {

			return ("{ " + this.x + ", " + this.y + " }");
		},

		rotate : function(angle) {

			var v = this.clone();
			angle = cc.degreesToRadians(angle);
			this.x = v.x * Math.cos(angle) - v.y  * Math.sin(angle);
			this.y = v.x * Math.sin(angle) + v.y  * Math.cos(angle);
			return (this);
		},

		flipY : function() {

			this.y = cc.Director.sharedDirector.winSize.height - this.y;
			return (this);
		},

		toB2 : function(v) {

			v = v || 1;
			return (new b2Vec2(this.x / v, this.y / v));
		},

		floor : function() {

			this.x = Math.floor(this.x);
			this.y = Math.floor(this.y);
			return (this);
		},

		precise : function(n) {

			var pow = Math.pow(10, n);
			this.x = Math.floor(this.x * pow) / pow;
			this.y = Math.floor(this.y * pow) / pow;
			return (this);
		},

		round : function() {

			this.x = Math.round(this.x);
			this.y = Math.round(this.y);
			return (this);
		},

		ceil : function() {

			this.x = Math.ceil(this.x);
			this.y = Math.ceil(this.y);
			return (this);
		},

		div : function(value) {

			if (value instanceof cc.Point) {
				this.x /= value.x;
				this.y /= value.y;
			} else {
				this.x /= value;
				this.y /= value;
			}
			return (this);
		},
    };

    for (var i in Point)
    	cc.Point.prototype[i] = Point[i];

	cc.Point.add = function(v1, v2) {

		return (cc.ccp(v1.x + v2.x, v1.y + v2.y));
	};

	cc.Point.sub = function(v1, v2) {

		return (cc.ccp(v1.x - v2.x, v1.y - v2.y));
	};

	cc.Point.scale = function(v, value) {

		return (cc.ccp(v.x, v.y).scale(value));
	};

	cc.Point.fromB2 = function(v1, v) {

		v = v || 1;
		return (cc.ccp(v1.x, v1.y).scale(v));
	};

	cc.Point.fromEvent = function(e) {

		return (cc.ccp(e.offsetX || e.originalEvent.layerX, e.offsetY || e.originalEvent.layerY))
	};

	cc.Point.fromSize = function(s) {

		return (cc.ccp(s.width, s.height));
	};

	cc.Point.fromObject = function(obj) {

		return (cc.ccp(obj.x, obj.y));
	};

	cc.Point.fromScale = function(entity) {

		return (cc.ccp(entity.scaleX, entity.scaleY));
	};

	b2Vec2.verticesFromArray = function(array, scale) {

        var vertices = [];
        scale = scale || 1;
        _.each(array, function(elem) {
            vertices.push(new b2Vec2(elem.x * scale, elem.y * scale));
        });
        return (vertices);
	};

	b2Vec2.verticesFromCollection = function(array, scale, pos) {

        var vertices = [];
        pos = pos || cc.ccp(0, 0);
        array.each(function(elem) {
            vertices.push(new b2Vec2((elem.get("x") + pos.x) * scale.x, (elem.get("y") + pos.y) * scale.x));
        });
        return (vertices);
	};

	b2Vec2.scaleVertices = function(array, scale) {

        scale = scale || 1;
		return (_.map(array, function(v) {
			return (new b2Vec2(v.x * scale, v.y * scale));
		}));
	};

	b2Vec2.isb2Ranged = function(v) {

		return (Math.inRange(Math.abs(v.x), 0.1, 10) && Math.inRange(Math.abs(v.y), 0.1, 10));
	},

	Math.inRange = function(v, min, max) {

		return (v >= min && v <= max);
	};

	Math.range = function(v, min, max) {

		return (v < min ? min : v > max ? max : v);
	};

	Math.minimize = function(v, min) {

		return (v < min ? min : v);
	};

	Math.maximize = function(v, max) {

		return (v > max ? max : v);
	};

	Math.precise = function(v, n) {

		var pow = Math.pow(10, n);
		return (Math.round(v * pow) / pow);
	};


    var Random = function(min, max) {

	    min = _.isUndefined(min) ? 0 : min;
	    max = _.isUndefined(max) ? min : max;
	    return (min + Math.random() * (max - min));
    };

    Random.int = function(min, max) {

	   return (Math.floor(Random(min, max)));
	};

	Random.prob = function(prob) {

 	    prob = _.isUndefined(prob) ? 0.5 : prob;
  	    return (Math.random() >= prob);
    };

	return ({

		DynamicScene : DynamicScene,
		Entity : Entity,
		Random : Random,
	});
})
