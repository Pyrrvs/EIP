define(["class", "kGE/kge", "model/LevelModel"], function(Class, kge) {

    function Entity() {

        Entity.superclass.constructor.apply(this, arguments)
    };

    Entity.physicLayer = [

        function(ctx) {

            var fixture = this.body.GetFixtureList();
            if (!fixture) return;
            ctx.lineWidth = 2 / this.scale / this.parent.scale;
            ctx.beginPath();
            ctx.arc(this.contentSize.width / 2, this.contentSize.height / 2,
                fixture.GetShape().GetRadius() * 30 / this.scale + 1, 0, 2 * Math.PI, false);
            ctx.strokeStyle = 'red';
            ctx.stroke();           
        },

        function(ctx) {

            var fixture = this.body.GetFixtureList();
        },
    ];

    Entity.inherit(kge.Entity, {

        physicLayer : null,
        modelLayer : null,

        draw : function(ctx) {

            if (this.modelLayer)
                Entity.superclass.draw.apply(this, arguments);
            if (this.model.get("body").get("shown"))
                for (var fixture = this.body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
                    var shape = fixture.GetShape(), type = shape.GetType(), scale = 30 / this.scale;
                    ctx.beginPath();
                    if (type == b2Shape.e_circleShape) {
                        ctx.lineWidth = 2 / this.scale / this.parent.scale;
                        ctx.arc(this.contentSize.width / 2 + shape.m_p.x * 30, this.contentSize.height / 2 + shape.m_p.y * 30,
                            shape.GetRadius() * scale, 0, 2 * Math.PI);
                        ctx.strokeStyle = "red";
                    } else if (type == b2Shape.e_polygonShape) {
                        var vertices = shape.GetVertices(), v = null, s = cc.Point.fromSize(this.contentSize).scale(0.5);
                        ctx.lineWidth = 2 / this.scale / this.parent.scale;
                        ctx.strokeStyle = "red";
                        v = cc.Point.fromB2(vertices[0], scale).add(s);
                        ctx.moveTo(v.x, v.y);
                        for (var i = 1; i < vertices.length; ++i) {
                            v = cc.Point.fromB2(vertices[i], scale).add(s);
                            ctx.lineTo(v.x, v.y);
                        }
                        v = cc.Point.fromB2(vertices[0], scale).add(s);
                        ctx.lineTo(v.x, v.y);
                    }
                    ctx.stroke();
                }
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
        save : { entities : new EntityCollection, camera : new CameraModel },
        disabled : null,
        scene : null,
        uiLayer : null,
        gameLayer : null,

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

            if (window.global.get("run") == "play") return ;
            if (window.global.get("run") == "stop") {
                this.save.entities.reset();
                this.save.camera = window.global.get("level").get("camera").clone();
                window.global.get("level").get("entities").each(function(entity) {
                    entity.set("id", entity.get("id"));
                    var s = entity.deepClone(true);
                    this.save.entities.push(s);
                }.bind(this));
            }
            this.gameLayer.children.forEach(function(entity) {
                entity.body.SetAwake(true);
            })
            this.scene.scheduleUpdate();
            window.global.set("run", "play");
        },

        clickPause : function() {

            if (window.global.get("run") == "pause") return ;
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

            if (window.global.get("run") == "stop") return ;
            this.scene.unscheduleUpdate();
            if (!window.global.get("level")) return ;
            var camera = window.global.get("level").get("camera");
            camera.attributes = this.save.camera.attributes;
            camera.trigger("change", camera, {});
            window.global.get("level").get("entities").each(function(model) {
                model.attributes = this.save.entities._byId[model.get("id")].attributes;
                var entity = model.entity, type = null;
                this.entityChanged(model);
                this.entityEnabledChanged(model);
                this.entityBodyChanged(model.get("body"));
                model.get("body").get("fixtures").each(function(fixture, __, fixtures) {
                    this.entityFixtureChanged(fixture, fixtures);
                }.bind(this));
                this.entityModelChanged(model.get("model"));
                type = entity.body.GetType();
                entity.body.SetType(0);
                entity.body.SetType(type);
            }.bind(this));
            if (window.global.get("entity"))
                window.global.get("entity").trigger("change", window.global.get("entity"), {});
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
            if (window.global.get("run") == "play") return ;
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

            if (window.global.get("run") == "play") return ;
            if (this.dragging.type == "camera")
                window.global.get("level").get("camera").set("position", cc.Point.add(this.dragging.position,
                    cc.ccp(a.deltaX, -a.deltaY)).floor());
            else if (this.dragging.type == "rotation")
                window.global.get("entity").set("rotation", Math.floor(this.dragging.rotation -
                    cc.Point.sub(this.dragging.position, this.uiLayer.selectCircle.position)
                    .angle(cc.Point.sub(this.transformPointEvent(e), this.uiLayer.selectCircle.position))));
            else if (this.dragging.type == "entity")
                window.global.get("entity").set("position", cc.Point.add(this.dragging.position,
                    cc.ccp(a.deltaX, -a.deltaY).rotate(this.uiLayer.rotation).scale(1 / this.uiLayer.scale).floor()));
        },

        transformPointEvent : function(e) {

            return (this.uiLayer.convertToNodeSpace(cc.Point.fromEvent(e).flipY()));
        },

        click : function(e) {

            if (window.global.get("run") == "play") return ;
            var entity = this.isEntityClicked(this.transformPointEvent(e));
            window.global.set("entity", entity ? entity.model : null);                
        },

        wheel : function(e) {

            if (window.global.get("run") == "play")
                return (false);
            if (window.global.get("mode") == "camera")
                window.global.get("level").get("camera").set("scale", Math.floor(Math.range(this.uiLayer.scale
                    + e.originalEvent.wheelDeltaY * 0.0001, 0.1, 10) * 1000) / 1000);
            else if (window.global.get("mode") == "entity" && window.global.get("entity"))
                window.global.get("entity").set("scale", Math.floor(Math.range(window.global.get("entity").get("scale")
                    + e.originalEvent.wheelDeltaY * 0.0001, 0.1, 10.0) * 1000) / 1000);
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

        selectedEntityChanged : function(global, entity) {

            this.$(entity ? "#entity" : "#camera").click();
        },

        updateBody : function(entity) {

            entity.body.SetPosition(entity.position.toB2(30));
            entity.body.SetAngle(cc.degreesToRadians(-entity.rotation));
        },

        entityChanged : function(model, init) {

            var entity = model.entity, data = model.attributes;
            entity.id = data.id;
            entity.position = data.position.clone();
            entity.scale = data.scale;
            entity.rotation = data.rotation;
            if (model.hasChanged("scale") || init)
                data.body.get("fixtures").each(function(fixture) {
                    this.entityFixtureShapeChanged(fixture);
                }.bind(this));
            this.updateBody(entity);
        },

        entityEnabledChanged : function(entity) {

            var data = entity.attributes;

            entity = entity.entity;
            entity.body.SetActive(data.enabled);
            if (!data.enabled) {
                this.disabled[entity.id] = entity;
                this.gameLayer.removeChild({ child : entity, cleanup : false });
            } else {
                this.gameLayer.addChild(entity);
                delete this.disabled[entity.id];
            }
        },

        entityBodyChanged : function(body) {

            var entity = body.entity;
            body = body.attributes;
            entity.body.SetType(body.type);
        },

        entityFixtureChanged : function(fixture) {

            var fix = fixture.fixture;
            if (fixture.get("type") == b2Shape.e_circleShape)
                fix.GetShape().m_p = fixture.get("position").toB2(30);
            else if (fixture.get("type") == b2Shape.e_polygonShape)
                this.entityFixtureShapeChanged(fixture);
            fix.SetDensity(fixture.get("density"));
            fix.SetFriction(fixture.get("friction"));
            fix.SetRestitution(fixture.get("restitution"));
            this.updateBody(fix.GetBody().entity);
        },

        entityFixtureShapeChanged : function(fixture) {

            var fix = fixture.fixture, shape = fix.GetShape(), scale = fix.GetBody().entity.scale / 30;
            if (fixture.get("type") == b2Shape.e_circleShape)
                shape.SetRadius(fixture.get("shape") * scale);
            else if (fixture.get("type") == b2Shape.e_polygonShape)
                shape.SetAsVector(b2Vec2.verticesFromCollection(fixture.get("shape"), scale, fixture.get("position")));
        },

        entityModelChanged : function(model) {

            var entity = model.entity;
            model = model.attributes;
            entity.setUrl(model.path);
            entity.modelLayer = model.shown;
        },

        verticeChanged : function(vertice, changed) {

            this.entityFixtureShapeChanged(vertice.fixture);
        },

        verticeAdded : function(vertice, vertices, init) {

            vertice.fixture = vertices.fixture;
            vertice.rebind("change", this.verticeChanged, this, !init);
        },

        verticeRemoved : function(vertice) {

            // TODO
        },

        fixtureAdded : function(fixture, fixtures) {

            var fixdef = new b2FixtureDef;
            if (fixture.get("type") == b2Shape.e_circleShape) {
                fixdef.shape = new b2CircleShape(1);
                fixture.fixture = fixtures.body.CreateFixture(fixdef);
            } else if (fixture.get("type") == b2Shape.e_polygonShape) {
                fixdef.shape = b2PolygonShape.AsBox(1, 1);
                fixture.fixture = fixtures.body.CreateFixture(fixdef);
                fixture.get("shape").fixture = fixture;
                fixture.get("shape").rebind("add", this.verticeAdded, this, true);
                fixture.get("shape").rebind("remove", this.verticeRemoved, this);
            }
            fixture.rebind("change:shape", this.entityFixtureShapeChanged, this)
            fixture.rebind("change", this.entityFixtureChanged, this, true);
        },

        fixtureRemoved : function(fixture) {

            fixture.fixture.GetBody().DestroyFixture(fixture.fixture);
        },

        cameraChanged : function(camera) {

            this.gameLayer.scale = camera.get("scale");
            this.gameLayer.position = camera.get("position").clone();
            this.gameLayer.rotation = camera.get("rotation");
            this.uiLayer.scale = camera.get("scale");
            this.uiLayer.position = camera.get("position").clone();
            this.uiLayer.rotation = camera.get("rotation");
        },

        entityAdded : function(model) {

            var entity = new Entity, fixture = null;
            entity.body = this.scene.world.CreateBody(new b2BodyDef);
            entity.body.entity = entity;
            entity.model = model;
            model.entity = entity;
            model.get("model").entity = entity;
            model.get("body").entity = entity;
            model.get("body").get("fixtures").body = entity.body;
            model.get("body").get("fixtures").rebind("add", this.fixtureAdded, this, true);
            model.get("body").get("fixtures").rebind("remove", this.fixtureRemoved, this);
            model.rebind("change", this.entityChanged, this, true);
            model.get("body").rebind("change", this.entityBodyChanged, this, true);
            model.get("model").rebind("change", this.entityModelChanged, this, true);
            model.rebind("change:enabled", this.entityEnabledChanged, this, true);
        },

        entityRemoved : function(entity, entities) {

            this.gameLayer.removeChild({ child : entity.entity, cleanup : true });
        },        

        levelChanged : function(global, level) {

            this.disabled = {};
            this.$("*").attr("disabled", !level);
            this.$("#canvasView canvas").toggle(!!level);
            this.gameLayer.removeChildren({ cleanup : true });
            this.$("#stop").click();
            if (!level) return;
            level.get("camera").rebind("change", this.cameraChanged, this, true);
            level.get("entities").rebind("add", this.entityAdded, this, true);
            level.get("entities").rebind("remove", this.entityRemoved, this);
        },
	});

    new GameView;
});