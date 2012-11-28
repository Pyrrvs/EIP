define([], function() {

	function DynamicScene() {

	    DynamicScene.superclass.constructor.call(this);
		this.world = new b2World(new b2Vec2(0, -10), true);
		this.layer = new cc.Layer;
		this.addChild(this.layer);
		this.scheduleUpdate();
	}

	DynamicScene.inherit(cc.Scene, {

		world : null,
		layer : null,

		update : function(dt) {

	        this.world.Step(dt, 10, 10);
	        this.world.ClearForces();
	        var entities = this.layer.children;
			for (var i in entities) {
	            var entity = entities[i];
	            if (entity.body) {
		            var	body = entity.body,
		                pos = body.GetPosition(),
		                angle = cc.radiansToDegrees(-body.GetAngle());
		            entity.position = new cc.Point(pos.x * 30, pos.y * 30);
		            entity.rotation = angle;
		        }
	        }
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

	        fixDef.density = 1;
	        fixDef.friction = 0.5;
	        fixDef.restitution = 0.5;
	        bodyDef.type = bodyType;
        	bodyDef.position.x = this.position.x / 30;
            bodyDef.position.y = this.position.y / 30;
			fixDef.shape = new b2CircleShape(32 / 30);
	        this.body = this.parent.parent.world.CreateBody(bodyDef)
	        this.body.CreateFixture(fixDef)
		}
	});

	return ({

		DynamicScene : DynamicScene,
		Entity : Entity,
	});
})