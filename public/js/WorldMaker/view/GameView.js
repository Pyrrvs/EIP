define(["class", "kGE/kge", "model/LevelModel"], function(Class, kge) {

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

    function UILayer() {

        UILayer.superclass.constructor.apply(this, arguments)
        this.selectCircle = new CircleSelect
        this.selectCircle.visible = false;
        this.addChild(this.selectCircle);

        window.global.bind("change:level", this.levelChanged, this);
        window.global.bind("change:entity", this.entitySelected, this);
        window.global.bind("change:run", this.runChanged, this);
    }

    UILayer.inherit(cc.Layer, {

        selectCircle : null,

        update : function() {

            var entity = window.global.get("entity");
            if (!entity) return ;
            var box = entity.entity.worldBoundingBox, size = box.size, pos = box.origin,
                len = size.width > size.height ? size.width : size.height;
            this.selectCircle.radius = Math.sqrt(2 * len * len) / 2;
            this.selectCircle.rotation = entity.entity.rotation;
            this.selectCircle.position.x = pos.x + len / 2;
            this.selectCircle.position.y = pos.y + len / 2;
        },

        runChanged : function(global, run) {

            if (run == "play") {
                this.visible = false;
            } else if (run == "stop") {
                this.visible = true;
            } else if (run == "pause") {
                this.visible = true;
                this.update();
            }
        },

        levelChanged : function(global, level) {

            if (level) {
                level.get("camera").unbind("change", this.update, this);
                level.get("camera").bind("change", this.update, this);
            }
            this.selectCircle.visible = false;
        },

        entitySelected : function(global, entity) {

            if (entity) {
                entity.unbind("change", this.update, this);
                entity.bind("change", this.update, this);
                this.update(entity);
            }
            this.selectCircle.visible = !!entity;
        },

        isCircleClicked : function(pos) {

            return (window.global.get("entity") && Math.abs(pos.dist(this.selectCircle.position) - this.selectCircle.radius) < 4);
        },
    })

    var GameView = Backbone.View.extend({

        el : $("#gameView"),
        dragging : { type : null, position : new cc.Point(0, 0), rotation : 0 },
        scene : null,
        uiLayer : null,
        gameLayer : null,
        save : new EntityCollection,

        events : {

            "dragstart canvas" : "dragstart",
            "drag canvas" : "drag",
            "click canvas" : "click",
            "mousewheel canvas" : "wheel",
            "click #play" : "clickPlay",
            "click #stop" : "clickStop",
            "click #pause" : "clickPause",
            "click #camera" : "clickCamera",
            "click #entity" : "clickEntity",
        },

        initialize : function() {

            window.global.bind("change:entity", this.entityChanged, this);
            window.global.bind("change:level", this.levelChanged, this);

            cc.Director.sharedDirector.attachInView(document.getElementById("canvasView"));
            cc.Director.sharedDirector.displayFPS = true
            this.scene = new kge.DynamicScene;
            this.gameLayer = new GameLayer;
            this.scene.addChild({ child : this.gameLayer, z : 0 });
            this.uiLayer = new UILayer;
            this.scene.addChild({ child : this.uiLayer, z : 1 });
        	cc.Director.sharedDirector.runWithScene(this.scene);
        },

        clickPlay : function() {

            if (window.global.get("run") == "play")
                return ;
            if (window.global.get("run") == "stop") {
                this.save.reset();
                window.global.get("level").get("entities").each(function(entity) {
                    this.save.push(entity.clone());
                }.bind(this));
            }
            this.scene.scheduleUpdate();
            window.global.set("run", "play");
        },

        clickPause : function() {

            if (window.global.get("run") == "pause")
                return ;
            if (window.global.get("run") == "stop")
                this.clickPlay();
            var opts = { silent : true };
            this.scene.unscheduleUpdate();
            this.gameLayer.children.forEach(function(entity) {
                entity.model.set("position", cc.ccp(entity.position.x, entity.position.y), opts);
                entity.model.set("rotation", entity.rotation, opts);
                entity.model.change();
            });
            window.global.set("run", "pause");
        },

        clickStop : function() {

            if (window.global.get("run") == "stop")
                return ;
            this.scene.unscheduleUpdate();
            window.global.get("level").get("entities").each(function(entity) {
                entity.attributes = this.save._byId[entity.get("id")].attributes;
            }.bind(this));
            var entity = window.global.get("entity");
            if (entity)
                entity.trigger("change", entity, {});
            this.gameLayer.children.forEach(function(entity) {
                this.entityUpdated(entity.model);
                var type = entity.body.GetType();
                entity.body.SetType(0);
                entity.body.SetType(type);
            }.bind(this));
            window.global.set("run", "stop");
        },

        clickCamera : function() {

            window.global.set("mode", "camera");
        },

        clickEntity : function() {

            window.global.set("mode", "entity");
        },

        dragstart : function(e) {

            this.dragging.type = null;
            if (window.global.get("run") == "play")
                return ;
            if (window.global.get("mode") == "camera") {
                this.dragging.position = this.gameLayer.position.clone();
                this.dragging.type = "camera";
            } else if (window.global.get("mode") == "entity") {
                var position = cc.Point.fromEvent(e).flipY(), entity = null;
                if (this.uiLayer.isCircleClicked(position)) {
                    this.dragging.position = position;
                    this.dragging.type = "rotation";
                    this.dragging.rotation = window.global.get("entity").entity.rotation;
                } else if ((entity = this.isEntityClicked(position))) {
                    this.dragging.position = entity.position.clone();
                    this.dragging.type = "entity";
                    window.global.set("entity", entity.model);
                } else
                    window.global.set("entity", null);
            }
        },

        drag : function(e, a) {

            if (window.global.get("run") == "play")
                return ;
            if (this.dragging.type == "camera")
                window.global.get("level").get("camera").set("position",
                cc.ccp(this.dragging.position.x + a.deltaX, this.dragging.position.y - a.deltaY));
            else if (this.dragging.type == "rotation") {
                var rotation = this.dragging.rotation - cc.Point.sub(this.dragging.position, this.uiLayer.selectCircle.position)
                .angle(cc.Point.sub(cc.Point.fromEvent(e).flipY(), this.uiLayer.selectCircle.position));
                window.global.get("entity").set("rotation", rotation);
            } else if (this.dragging.type == "entity") {
                var position = cc.ccp(this.dragging.position.x + a.deltaX / this.gameLayer.scale,
                                    this.dragging.position.y - a.deltaY / this.gameLayer.scale);
                window.global.get("entity").set("position", position);
            }
        },

        click : function(e) {

            if (window.global.get("run") == "play")
                return ;
            var entity = this.isEntityClicked(cc.Point.fromEvent(e).flipY());
            window.global.set("entity", entity ? entity.model : null);                
        },

        wheel : function(e) {

            if (window.global.get("run") == "play")
                return (false);
            if (window.global.get("mode") == "camera") {
                var scale = this.gameLayer.scale + e.originalEvent.wheelDeltaY * 0.0001;
                scale = scale < 0.1 ? 0.1 : scale > 5 ? 5 : scale;
                window.global.get("level").get("camera").set("zoom", scale);
            } else if (window.global.get("mode") == "entity" && window.global.get("entity")) {
                var scale = window.global.get("entity").get("scale") + e.originalEvent.wheelDeltaY * 0.0001;
                scale = scale < 0.1 ? 0.1 : scale > 5.0 ? 5.0 : scale;
                window.global.get("entity").set("scale", parseFloat(scale.toFixed(3)));
            }
            return (false);
        },

        isEntityClicked : function(position) {

            var entity = null;
            this.gameLayer.children.forEach(function(elem, i, children) {
                if (cc.rectContainsPoint(elem.worldBoundingBox, position))
                    entity = elem;
            });
            return (entity);
        },

        entityChanged : function(global, entity) {

            if (entity) {
                entity.unbind("change", this.entityUpdated, this);
                entity.bind("change", this.entityUpdated, this);
            }
        },

        entityUpdated : function(entityModel) {

            var entity = entityModel.entity, data = entityModel.attributes;
            entity.position = cc.ccp(data.position.x, data.position.y);
            entity.scale = data.scale;
            entity.rotation = data.rotation;
            entity.body.SetType(data.body.type);
            entity.body.SetPosition(new b2Vec2(entity.position.x / 30, entity.position.y / 30));
            entity.body.SetAngle(cc.degreesToRadians(-entity.rotation));
        },

        addEntity : function(model) {

            var data = model.attributes, entity = null, fixDef = new b2FixtureDef, bodyDef = new b2BodyDef;

            if (data.model.url)
                entity = new kge.Entity(data.model);
            else if (data.model.box)
                entity = new Box(data.model.box.w, data.model.box.h);
            this.gameLayer.addChild(entity);
            entity.id = data.id;
            entity.model = model;
            fixDef.density = 1.0;
            fixDef.friction = 0.1;
            fixDef.restitution = 0.6;
            bodyDef.type = data.body.type;
            bodyDef.position = new b2Vec2(entity.position.x / 30, entity.position.y / 30);
            bodyDef.angle = cc.degreesToRadians(-entity.rotation);
            if (data.body.circle)
                fixDef.shape = new b2CircleShape(data.body.circle / 30)
            else if (data.body.box) {
                fixDef.shape = new b2PolygonShape;
                fixDef.shape.SetAsBox(data.body.box.w / 30, data.body.box.h / 30);
            }
            entity.body = this.scene.world.CreateBody(bodyDef);
            entity.body.CreateFixture(fixDef);
            model.entity = entity;
            this.entityUpdated(model);
        },

        cameraChanged : function(camera) {

            this.gameLayer.position = camera.get("position").clone();
            this.gameLayer.scale = camera.get("zoom");
        },

        levelChanged : function(global, level) {

            this.gameLayer.removeChildren({ cleanup : true });
            if (level) {
                level.get("camera").unbind("change", this.cameraChanged, this);
                level.get("camera").bind("change", this.cameraChanged, this);
                this.cameraChanged(level.get("camera"));
                level.get("entities").unbind("add", this.entityAdded, this);
                level.get("entities").unbind("remove", this.entityRemoved, this);
                level.get("entities").bind("add", this.entityAdded, this);
                level.get("entities").bind("remove", this.entityRemoved, this);
                level.get("entities").each(function(elem) {
                    this.addEntity(elem);
                }.bind(this));
            } else
                this.$("#stop").click();
        },
	});

    new GameView;
});