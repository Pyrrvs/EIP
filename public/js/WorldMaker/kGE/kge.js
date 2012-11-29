define([], function() {

	function DynamicScene() {

	    DynamicScene.superclass.constructor.call(this);
		this.world = new b2World(new b2Vec2(0, -10), true);
	}

	DynamicScene.inherit(cc.Scene, {

		world : null,
		layer : null,

		update : function(dt) {

	        this.world.Step(dt, 10, 10);
	        this.world.ClearForces();
			this.layer.children.forEach(function(entity, i) {
	            if (entity.body) {
	                entity.position = cc.Point.scale(entity.body.GetPosition(), 30);
		            entity.rotation = cc.radiansToDegrees(-entity.body.GetAngle());
		        }
	        });
		}
	});

	function Entity(settings) {

		Entity.superclass.constructor.call(this, settings);
	};

	Entity.inherit(cc.Sprite, {

		body : null,
		shape : null,

		setBody : function(bodyType) {

			var fixDef = new b2FixtureDef;
			var bodyDef = new b2BodyDef;

	        bodyDef.type = bodyType;
        	bodyDef.position.x = this.position.x / 30;
            bodyDef.position.y = this.position.y / 30;
			fixDef.shape = new b2CircleShape(32 / 30);
	        (this.body = this.parent.parent.world.CreateBody(bodyDef)).CreateFixture(fixDef);
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

			this.x *= value;
			this.y *= value;
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
			//	   angle = Math.radians(angle);
			this.x = v.x * Math.cos(angle) - v.y  * Math.sin(angle);
			this.y = v.x * Math.sin(angle) + v.y  * Math.cos(angle);
			return (this);
		},

		flipY : function() {

			this.y = cc.Director.sharedDirector.winSize.height - this.y;
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

		return (cc.ccp(v.x * value, v.y * value));
	};

	cc.Point.fromEvent = function(e) {

		return (cc.ccp(e.offsetX, e.offsetY))
	};

	return ({

		DynamicScene : DynamicScene,
		Entity : Entity,
	});

})