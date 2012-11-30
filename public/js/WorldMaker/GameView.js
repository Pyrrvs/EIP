define(["class", "kGE/kge"], function(Class, kge) {

    function GameLayer() {

        GameLayer.superclass.constructor.apply(this, arguments)
    }

    GameLayer.inherit(cc.Layer, {

    })

    function Box(width, height) {

        Box.superclass.constructor.call(this);
        this.width = width;
        this.height = height;
    }

    Box.inherit(cc.Node, {

        width : null,
        height : null,

        draw : function(ctx) {

            ctx.lineWidth = 5;
            ctx.strokeStyle = "blue";
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
    });


    function CircleSelect() {

        CircleSelect.superclass.constructor.apply(this, arguments);
    }

    CircleSelect.inherit(cc.Node, {

        radius : 1,

        _drawDashCircle : function(ctx, start, end, color) {

            ctx.beginPath();
            ctx.arc(0, 0, this.radius, start, end, false);
            ctx.strokeStyle = color;
            ctx.stroke();            
        },

        _drawDashLine : function(ctx, start, end, color) {

            if (end < this.radius) {
                ctx.beginPath();
                ctx.moveTo(start, 0);
                ctx.lineTo(end, 0);
                ctx.strokeStyle = color;
                ctx.stroke();
            }
        },

        draw : function(ctx) {

            var n = this.radius, step = 2 * Math.PI / n / 2, start = -step, end = 0;
            ctx.lineWidth = 2;
            for (var i = 0; i < n; ++i) {
                this._drawDashCircle(ctx, start += step, end += step, 'white');
                this._drawDashCircle(ctx, start += step, end += step, 'blue');
            }
            n /= 6;
            start = 0;
            step = this.radius / n / 2;
            for (var i = 0; i < n; ++i) {
                this._drawDashLine(ctx, start, start += step, 'white');
                this._drawDashLine(ctx, start, start += step, 'blue');
            }
        }
    });

    function SupLayer() {

        SupLayer.superclass.constructor.apply(this, arguments)
        this.selectCircle = new CircleSelect
        this.selectCircle.visible = false;
        this.addChild(this.selectCircle);
    }

    SupLayer.inherit(cc.Layer, {

        selectCircle : null,
        selectedEntity : null,

        updateSelect : function() {

            if (this.selectedEntity) {
                var box = this.selectedEntity.worldBoundingBox, size = box.size, pos = box.origin,
                    len = size.width > size.height ? size.width : size.height;
                this.selectCircle.radius = Math.sqrt(2 * len * len) / 2;
                this.selectCircle.rotation = this.selectedEntity.rotation;
                this.selectCircle.position.x = pos.x + len / 2;
                this.selectCircle.position.y = pos.y + len / 2;
            }
        },

        select : function(entity) {

            this.selectedEntity = entity;
            this.updateSelect();
            this.selectCircle.visible = !!entity;
            if (entity)
                levelView.selectEntity(entity.id);
            return (entity);
        },

        isCircleClicked : function(pos) {

            return (this.selectedEntity &&  Math.abs(pos.dist(this.selectCircle.position) - this.selectCircle.radius) < 4);
        },

        isSelectedEntity : function(entity) {

            return (!(!this.entity || this.entity.id == entity.id ? false : true));
        }
    })

    var GameView = Class.extend({

        scene : null,
        $ : $("#gameView"),
        menu : $("#gameView #menu"),
        pos : new cc.Point(0, 0),
        cameraDragging : false,
        entityRotating : false,
        entityDragging : false,
        rot : 0,

        init : function() {

            var director = cc.Director.sharedDirector, self = this;
            director.attachInView(document.getElementById("canvasView"));
            director.displayFPS = true
            this.scene = new kge.DynamicScene
            this.scene.layer = new GameLayer;
            this.scene.addChild({ child : this.scene.layer, z : 0 });
            this.scene.supLayer = new SupLayer;
            this.scene.addChild({ child : this.scene.supLayer, z : 1 });
        	director.runWithScene(this.scene);

//            this.menu.find("#entity").click();

            this.menu.find("#play").click(function(e) {
                if ($(e.target).hasClass("active"))
                    return;
                self.scene.supLayer.visible = false;
                self.scene.scheduleUpdate();
            }).next().click(function(e) {
                if ($(e.target).hasClass("active"))
                    return;
                self.scene.unscheduleUpdate();
                self.scene.supLayer.visible = true;
                var entities = levelView.levels[levelView.currentLevel].entities;
                for (var i in entities) {
                    var entity = self.updateEntity(entities[i]), type = entity.body.GetType();
                    entity.body.SetType(b2Body.b2_staticBody);
                    entity.body.SetType(type);
                }
            }).next().click(function(e) {
                if ($(e.target).hasClass("active"))
                    return;
                self.scene.unscheduleUpdate();
                self.scene.supLayer.visible = true;
                self.scene.supLayer.updateSelect();
            });
            this.$.find("#canvasView").bind("mousewheel", function(e) {
                if (self.menu.find("#camera").hasClass("active")) {
                    var scale = self.scene.layer.scale;
                    scale += e.originalEvent.wheelDeltaY * 0.0001;
                    if (scale < 0.1)
                        scale = 0.1;
                    else if (scale > 5)
                        scale = 5;
                    self.scene.layer.scale = scale;
                    self.scene.supLayer.updateSelect();
                }
                return (false);
            }).drag("start", function(e) {
                self.cameraDragging = false;
                self.entityRotating = false;
                self.entityDragging = false;
                if (self.menu.find("#play").hasClass("active"))
                    return
                if (self.menu.find("#camera").hasClass("active")) {
                    self.pos = self.scene.layer.position.clone();
                    self.cameraDragging = true;
                } else {
                    var pos = cc.Point.fromEvent(e).flipY(), entity = null;
                    if (self.scene.supLayer.isCircleClicked(pos)) {
                        self.pos = pos;
                        self.entityRotating = true;
                        self.rot = parseFloat($("#menuView #tab-entity #rotation").val());
                    } else if (entity = self.hitEntity(pos)) {
                        self.pos = entity.position.clone();
                        self.entityDragging = true;
                        self.scene.supLayer.select(entity);
                    } else
                        self.scene.supLayer.select(entity);
                }
            }).drag(function(e, a) {
                if (self.cameraDragging)
                    self.scene.layer.position = cc.ccp(self.pos.x + a.deltaX, self.pos.y - a.deltaY);
                else if (self.entityRotating) {
                    var rotation = self.rot - cc.Point.sub(self.pos, self.scene.supLayer.selectCircle.position)
                    .angle(cc.Point.sub(cc.Point.fromEvent(e).flipY(), self.scene.supLayer.selectCircle.position));
                    if (self.menu.find("#stop").hasClass("active"))
                        $("#menuView #tab-entity #rotation").val(rotation).change();
                    else {
                        var entity = self.scene.supLayer.selectedEntity;
                        entity.rotation = rotation;
                        entity.body.SetAngle(cc.degreesToRadians(-entity.rotation));
                    }
                }
                else if (self.entityDragging) {
                    var position = cc.ccp(self.pos.x + a.deltaX / self.scene.layer.scale, self.pos.y - a.deltaY / self.scene.layer.scale);
                    if (self.menu.find("#stop").hasClass("active"))
                        $("#menuView #tab-entity #position-x").val(position.x).next().next().val(position.y).change();
                    else {
                        var entity = self.scene.supLayer.selectedEntity;
                        entity.position = position;
                        entity.body.SetPosition(new b2Vec2(entity.position.x / 30, entity.position.y / 30));
                    }
                }
                self.scene.supLayer.updateSelect();
            }).click(function(e) {
                if (!self.scene.supLayer.isCircleClicked(cc.Point.fromEvent(e).flipY().scale(0.5)))
                     self.scene.supLayer.select(self.hitEntity(cc.Point.fromEvent(e).flipY()));
            });
        },

        hitEntity : function(pos) {

            var entity = null;
            this.scene.layer.children.forEach(function(elem, i, children) {
                if (cc.rectContainsPoint(elem.worldBoundingBox, pos))
                    entity = elem;
            });
            return (entity);
        },

        _updateEntity : function(entity, data) {

            entity.position = cc.ccp(data.position.x, data.position.y);
            entity.scale = data.scale;
            entity.rotation = data.rotation;
            entity.body.SetPosition(new b2Vec2(entity.position.x / 30, entity.position.y / 30));
            entity.body.SetAngle(cc.degreesToRadians(-entity.rotation));
            if (this.scene.supLayer.isSelectedEntity(entity))
                this.scene.supLayer.updateSelect();
        },

        getEntityById : function(id) {

            var entity = null;
            for (var i in this.scene.layer.children) {
                entity = this.scene.layer.children[i];
                if (entity.id == id)
                    return (entity);
            }
            return (entity);
        },

        updateEntity : function(data) {

            var entity = this.getEntityById(data.id);
            this._updateEntity(entity, data);
            return (entity);
        },

        newEntity : function(data) {

            var entity = null;

            if (data.model.url)
                entity = new kge.Entity(data.model);
            else if (data.model.box)
                entity = new Box(data.model.box.w, data.model.box.h);
            this.scene.layer.addChild(entity);
            entity.id = data.id;

            var fixDef = new b2FixtureDef;
            var bodyDef = new b2BodyDef;

            fixDef.density = 1.0;
            fixDef.friction = 0.1;
            fixDef.restitution = 0.6;
            bodyDef.type = data.body;
            bodyDef.position = new b2Vec2(entity.position.x / 30, entity.position.y / 30);
            bodyDef.angle = cc.degreesToRadians(-entity.rotation);
            if (data.circle)
                fixDef.shape = new b2CircleShape(data.circle / 30)
            else if (data.box) {
                fixDef.shape = new b2PolygonShape;
                fixDef.shape.SetAsBox(data.box.w / 30, data.box.h / 30);
            }
            entity.body = this.scene.world.CreateBody(bodyDef);
            entity.body.CreateFixture(fixDef);
            this._updateEntity(entity, data);
        },

        selectEntity : function(data) {

            var entity = this.getEntityById(data.id);
            this.scene.supLayer.select(entity);
            return (entity);
        },

        setUpLevel : function(level, diff) {

            this.scene.supLayer.select(null);
            if (!diff)
                return ;
            this.$.find("#stop").click();
            this.scene.layer.removeChildren({ cleanup : true });
            this.scene.layer.scale = level.camera.zoom;
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
