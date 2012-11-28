define(["class", "kGE/kge"], function(Class, kge) {

        var GameView = Class.extend({

                scene : null,

                init : function() {

                        var director = cc.Director.sharedDirector
                        director.attachInView(document.getElementById("canvasView"));
                        director.displayFPS = true
                        this.scene = new kge.DynamicScene
                	director.runWithScene(this.scene)
                },

                updateEntity : function(data) {

                        var entity = null;
                        for (var i in this.scene.layer.children) {
                                entity = this.scene.layer.children[i];
                                if (entity.id == data.id) {
                                        entity.position = new cc.Point(data.position.x, data.position.y);
                                        entity.scale = data.scale;
                                        entity.rotation = data.rotation;
                                }
                        }
                },

                newEntity : function(data) {

                        var entity = new kge.Entity(data.model);
                        this.scene.layer.addChild(entity);
                        entity.id = data.id;
                        this.updateEntity(data);
                },

                setUpLevel : function(level) {

                        for (var i in level.entities)
                                this.newEntity(level.entities[i])
                },
	});

        return (function() { return new GameView } );
});

// var director = cc.Director.sharedDirector
// director.attachInView(document.getElementById('gameView'))
// director.displayFPS = true

// var scene = new kge.DynamicScene

// var bg = new kge.Entity({url : "resource/map1.png"});
// bg.position = new cc.Point(5750, 240)
// scene.layer.addChild(bg);
// bg.setBody();

// var entity = new kge.Entity({url : 'resource/ball.png'});
// entity.position = new cc.Point(200, 200)
// entity.scale = 1;
// scene.layer.addChild(entity);
// entity.setBody();

// var world = scene.world;
// var fixDef = new b2FixtureDef
// fixDef.density = 1.0
// fixDef.friction = 0.5
// fixDef.restitution = 0.2

// var bodyDef = new b2BodyDef

// //create ground
// bodyDef.type = b2Body.b2_staticBody
// fixDef.shape = new b2PolygonShape
// fixDef.shape.SetAsBox(20, 2)
// bodyDef.position.Set(10, 400 / 30 + 2)
// world.CreateBody(bodyDef).CreateFixture(fixDef)
// bodyDef.position.Set(10, -2)
// world.CreateBody(bodyDef).CreateFixture(fixDef)
// fixDef.shape.SetAsBox(2, 14)
// bodyDef.position.Set(-2, 13)
// world.CreateBody(bodyDef).CreateFixture(fixDef)
// bodyDef.position.Set(22, 13)
// world.CreateBody(bodyDef).CreateFixture(fixDef)

// director.runWithScene(scene)
