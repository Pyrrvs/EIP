define(["class", "kGE/kge", "model/LevelModel"], function(Class, kge) {

    function Entity() {

        Entity.superclass.constructor.apply(this, arguments)
    };

    Entity.physicLayer = {

        circle : function(ctx) {

            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.contentSize.width / 2, this.contentSize.height / 2,
                this.body.GetFixtureList().GetShape().GetRadius() * 30 / this.scale + 1, 0, 2 * Math.PI, false);
            ctx.strokeStyle = 'red';
            ctx.stroke();            
        },

        box : function(ctx) {

            var width = this.model.get("body").get("fixture").get("shape").w,
                height = this.model.get("body").get("fixture").get("shape").h;

            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.strokeStyle = "red";
            ctx.strokeRect(-1, -1, width + 1, height + 1);
        },

        polygon : function(ctx) {

            // TODO
        },
    };

    Entity.inherit(kge.Entity, {

        physicLayer : null,
        modelLayer : null,

        draw : function(ctx) {

            if (this.modelLayer)
                Entity.superclass.draw.apply(this, arguments);
            if (this.physicLayer)
                this.physicLayer(ctx);
        },
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

            var n = this.radius * this.parent.scale, step = 2 * Math.PI / n / 2, start = -step, end = 0;
            ctx.lineWidth = 2 / this.parent.scale;
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
        },

        update : function() {

            var entity = window.global.get("entity");
            if (!entity) return ;
            entity = entity.entity;
            var box = entity.boundingBox, size = box.size, pos = box.origin;
            this.radius = Math.sqrt(Math.pow(size.width, 2) + Math.pow(size.height, 2)) / 2;
            this.rotation = entity.rotation;
            this.position.x = pos.x + size.width / 2;
            this.position.y = pos.y + size.height / 2;
        },
    });

    function UILayer() {

        UILayer.superclass.constructor.apply(this, arguments)
        this.addChild(this.selectCircle = new CircleSelect);

        window.global.bind("change:level", this.levelChanged, this);
        window.global.bind("change:entity", this.entitySelectedChanged, this);
        window.global.bind("change:run", this.runChanged, this);
    }

    UILayer.inherit(cc.Layer, {

        selectCircle : null,

        runChanged : function(global, run) {

            if (run == "play") {
                this.selectCircle.visible = false;
            } else if (run == "stop") {
                this.selectCircle.update();
                this.entityEnabledChanged();
            } else if (run == "pause") {
                this.selectCircle.update();
                this.entityEnabledChanged();
            }
        },

        update : function(camera) {

            this.scale = camera.get("zoom");
            this.position = camera.get("position").clone();
        },

        levelChanged : function(global, level) {

            if (level) {
                level.get("camera").rebind("change", this.update, this, true);
            }
        },

        entityEnabledChanged : function(entity) {

            entity = entity || window.global.get("entity");
            if (entity && entity.get("enabled")) {
                this.selectCircle.update();
                this.selectCircle.visible = true;
            } else
                this.selectCircle.visible = false;
        },

        entitySelectedChanged : function(global, entity) {

            if (entity) {
                entity.rebind("change", this.selectCircle.update, this.selectCircle);
                entity.rebind("change:enabled", this.entityEnabledChanged, this);
                this.entityEnabledChanged(entity);
            } else
                this.selectCircle.visible = false;
        },

        isCircleClicked : function(pos) {

            return (window.global.get("entity") && Math.abs(pos.dist(this.selectCircle.position) - this.selectCircle.radius) < 5 / this.scale);
        },
    })

    var GameView = Backbone.View.extend({

        el : $("#gameView"),
        dragging : { type : null, position : new cc.Point(0, 0), rotation : 0 },
        disabled : null,
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

            window.global.bind("change:entity", this.selectedEntityChanged, this);
            window.global.bind("change:level", this.levelChanged, this);

            cc.Director.sharedDirector.attachInView(document.getElementById("canvasView"));
            cc.Director.sharedDirector.displayFPS = true
            this.scene = new kge.DynamicScene;
            this.gameLayer = new cc.Layer;
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
                    var s = entity.clone();
                    s.attributes = $.extend(true, {}, entity.attributes);
                    this.save.push(s);
                }.bind(this));
            }
            this.gameLayer.children.forEach(function(entity) {
                entity.body.SetAwake(true);
            })
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
            if (!window.global.get("level"))
                return ;
            window.global.get("level").get("entities").each(function(entity) {
                entity.attributes = this.save._byId[entity.get("id")].attributes;
            }.bind(this));
            var entity = window.global.get("entity");
            if (entity)
                entity.trigger("change", entity, {});
            this.gameLayer.children.forEach(function(entity) {
                this.entityChanged(entity.model);
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
                var position = this.transformPointEvent(e), entity = null;
                if (this.uiLayer.isCircleClicked(position)) {
                    this.dragging.position = position;
                    this.dragging.type = "rotation";
                    this.dragging.rotation = window.global.get("entity").entity.rotation;
                } else if ((entity = window.global.get("entity"))) {
                    this.dragging.position = entity.entity.position.clone();
                    this.dragging.type = "entity";
                } else if ((entity = this.isEntityClicked(position))) {
                    this.dragging.position = entity.position.clone();
                    this.dragging.type = "entity";
                    window.global.set("entity", entity.model);
                }
            }
        },

        drag : function(e, a) {

            if (window.global.get("run") == "play")
                return ;
            if (this.dragging.type == "camera")
                window.global.get("level").get("camera").set("position",
                cc.ccp(Math.floor(this.dragging.position.x + a.deltaX), Math.floor(this.dragging.position.y - a.deltaY)));
            else if (this.dragging.type == "rotation") {
                var rotation = Math.floor(this.dragging.rotation - cc.Point.sub(this.dragging.position, this.uiLayer.selectCircle.position)
                .angle(cc.Point.sub(this.transformPointEvent(e), this.uiLayer.selectCircle.position)));
                window.global.get("entity").set("rotation", rotation);
            } else if (this.dragging.type == "entity") {
                var position = cc.ccp(Math.floor(this.dragging.position.x + a.deltaX / this.gameLayer.scale),
                                    Math.floor(this.dragging.position.y - a.deltaY / this.gameLayer.scale));
                window.global.get("entity").set("position", position);
            }
        },

        transformPointEvent : function(e) {

            return (this.uiLayer.convertToNodeSpace(cc.Point.fromEvent(e).flipY()));
        },

        click : function(e) {

            if (window.global.get("run") == "play")
                return ;
            var entity = this.isEntityClicked(this.transformPointEvent(e));
            window.global.set("entity", entity ? entity.model : null);                
        },

        wheel : function(e) {

            if (window.global.get("run") == "play")
                return (false);
            if (window.global.get("mode") == "camera") {
                var scale = this.gameLayer.scale + e.originalEvent.wheelDeltaY * 0.0001;
                scale = scale < 0.1 ? 0.1 : scale > 5 ? 5 : scale;
                window.global.get("level").get("camera").set("zoom", Math.floor(scale * 1000) / 1000);
            } else if (window.global.get("mode") == "entity" && window.global.get("entity")) {
                var scale = window.global.get("entity").get("scale") + e.originalEvent.wheelDeltaY * 0.0001;
                scale = scale < 0.1 ? 0.1 : scale > 5.0 ? 5.0 : scale;
                window.global.get("entity").set("scale", Math.floor(scale * 1000) / 1000);
            }
            return (false);
        },

        isEntityClicked : function(position) {

            var entity = null;
            this.gameLayer.children.forEach(function(elem, i, children) {
                if (cc.rectContainsPoint(elem.boundingBox, position))
                    entity = elem;
            });
            return (entity);
        },

        entityEnabledChanged : function(entity) {

            var data = entity.attributes;

            entity = entity.entity;
            if (!data.enabled) {
                entity.body.SetActive(false);
                this.disabled[entity.id] = entity;
                this.gameLayer.removeChild({ child : entity, cleanup : false });
            } else {
                entity.body.SetActive(true);
                this.gameLayer.addChild(entity);
                delete this.disabled[entity.id];
            }
        },

        selectedEntityChanged : function(global, entity) {

            if (entity) {
                this.$("#entity").click();
                entity.rebind("change", this.entityChanged, this);
                entity.rebind("change:enabled", this.entityEnabledChanged, this);
                entity.get("body").rebind("change", this.entityBodyChanged, this);
                entity.get("body").get("fixture").rebind("change", this.entityFixtureChanged, this);
                entity.get("model").rebind("change", this.entityModelChanged, this);
            } else
                this.$("#camera").click();
        },

        updateEntityShape : function(entity, fixture) {

            var fix = entity.body.GetFixtureList();

            if (!fix)
                return;
            if (fixture.shape_type == "circle")
                fix.GetShape().SetRadius(fixture.shape.r * entity.scale / 30);
            else if (fixture.shape_type == "box")
                fix.GetShape().m_radius = 0.01;
        },

        entityChanged : function(model) {

            var entity = model.entity, data = model.attributes;
            entity.id = data.id;
            entity.position = data.position.clone();
            entity.scale = data.scale;
            entity.rotation = data.rotation;
            this.updateEntityShape(entity, data.body.get("fixture").attributes);
            entity.body.SetPosition(entity.position.toB2(30));
            entity.body.SetAngle(cc.degreesToRadians(-entity.rotation));
        },

        entityBodyChanged : function(body, entity) {

            entity = entity instanceof Entity ? entity : window.global.get("entity").entity;
            body = body.attributes;
            entity.body.SetType(body.type);
            entity.physicLayer = entity.model.get("body").get("shown") ? Entity.physicLayer[body.fixture.get("shape_type")] : null;
        },

        entityFixtureChanged : function(fixture, entity) {

            entity = entity instanceof Entity ? entity : window.global.get("entity").entity;
            fixture = fixture.attributes;
            var fix = entity.body.GetFixtureList();
            if (fix == null) {
                var fixdef = new b2FixtureDef;
                if (fixture.shape_type == "circle")
                    fixdef.shape = new b2CircleShape(fixture.shape.r * entity.scale / 30.0)
                else if (fixture.shape_type == "box") {
                    fixdef.shape = new b2PolygonShape;
                    fixdef.shape.SetAsBox(fixture.shape.w * entity.scale / 30.0 / 2, fixture.shape.h * entity.scale / 30.0 / 2);
                } else if (fixture.shape_type == "polygon") {
                    fixdef.shape = new b2PolygonShape;
                    fixdef.shape.SetAsBox(fixture.shape.w / 30.0, fixture.shape.h / 30.0);
                }
                fix = entity.body.CreateFixture(fixdef);
            }            
            fix.SetDensity(fixture.density);
            fix.SetFriction(fixture.friction);
            fix.SetRestitution(fixture.restitution);
            if (entity.id == "crate")
                entity.scale = 0.5;
        },

        entityModelChanged : function(model, entity) {

            entity = entity instanceof Entity ? entity : window.global.get("entity").entity;
            model = model.attributes;
            entity.setUrl(model.path);
            entity.modelLayer = model.shown;
        },

        cameraChanged : function(camera) {

            this.gameLayer.scale = camera.get("zoom");
            this.gameLayer.position = camera.get("position").clone();
        },

        entityAdded : function(model) {

            var entity = new Entity;
            this.gameLayer.addChild(entity);
            entity.model = model;
            entity.body = this.scene.world.CreateBody(new b2BodyDef);
            model.entity = entity;
            this.entityChanged(model);
            this.entityBodyChanged(model.get("body"), entity);
            this.entityModelChanged(model.get("model"), entity);
            this.entityFixtureChanged(model.get("body").get("fixture"), entity);
        },

        entityRemoved : function(entity, entities) {

            this.gameLayer.removeChild({ child : entity.entity, cleanup : true });
        },        

        levelChanged : function(global, level) {

            this.gameLayer.removeChildren({ cleanup : true });
            this.disabled = {};
            this.$("#stop").click();
            if (level) {
                this.$("#canvasView canvas").show();
                this.$("*").removeAttr("disabled");
                level.get("camera").rebind("change", this.cameraChanged, this, true);
                level.get("entities").rebind("add", this.entityAdded, this);
                level.get("entities").rebind("remove", this.entityRemoved, this);
                level.get("entities").each(function(elem) {
                    this.entityAdded(elem);
                }.bind(this));
            } else {
                this.$("#canvasView canvas").hide();
                this.$("*").attr("disabled", "");
            }
        },
	});

    new GameView;
});