define(["class", "kGE/kge", "model/LevelModel"], function(Class, kge) {

    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED
    // FIX BUG TOGGLE LAYERS AFTER PLAYED

    function Entity() {

        Entity.superclass.constructor.apply(this, arguments)
    };

    Entity.inherit(kge.Entity, {

        physicLayer : null,
        modelLayer : null,

        _isAngleOk : function(p1, p2, p3) {

            var angle = cc.Point.sub(p1, p2).angle(cc.Point.sub(p1, p3));
            return (angle < 0 && angle > -180);
        },

        isPolygonConvexAndCCW : function(vertices) {

            var idx = vertices.length - 1;
            if (idx < 2)
                return (false);
            if (!this._isAngleOk(vertices[0], vertices[idx], vertices[1]))
                return (false);
            for (i = 1; i < idx; ++i)
                if (!this._isAngleOk(vertices[i], vertices[i - 1], vertices[i + 1]))
                    return (false);
            if (!this._isAngleOk(vertices[idx], vertices[idx - 1], vertices[0]))
                return (false);
            return (true);
        },

        draw : function(ctx) {

            if (this.model.get("model").get("shown"))
                Entity.superclass.draw.apply(this, arguments);
            if (this.model.get("body").get("shown"))
                for (var fixture = this.body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
                    var shape = fixture.GetShape(), type = shape.GetType(), scale = 30 / this.scale;
                    ctx.beginPath();
                    if (type == b2Shape.e_circleShape) {
                        ctx.lineWidth = 1.5 / this.scale / this.parent.scale;
                        ctx.arc(this.contentSize.width / 2 + shape.m_p.x * 30, this.contentSize.height / 2 + shape.m_p.y * 30,
                            shape.GetRadius() * scale, 0, 2 * Math.PI);
                        ctx.strokeStyle = "green";
                    } else if (type == b2Shape.e_polygonShape) {
                        var vertices = shape.GetVertices(), v = null, s = cc.Point.fromSize(this.contentSize).scale(0.5);
                        ctx.lineWidth = 1.5 / this.scale / this.parent.scale;
                        v = cc.Point.fromB2(vertices[0], scale).add(s);
                        ctx.moveTo(v.x, v.y);
                        for (var i = 1; i < vertices.length; ++i) {
                            v = cc.Point.fromB2(vertices[i], scale).add(s);
                            ctx.lineTo(v.x, v.y);
                        }
                        v = cc.Point.fromB2(vertices[0], scale).add(s);
                        ctx.strokeStyle = this.isPolygonConvexAndCCW(vertices) ? "green" : "red";
                        ctx.lineTo(v.x, v.y);
                    }
                    ctx.stroke();
                }
        },
    });

    function SelectCircle() {

        SelectCircle.superclass.constructor.apply(this, arguments);
    }

    SelectCircle.inherit(cc.Node, {

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

            var entity = App.global.get("entity");
            if (!entity) return ;
            entity = entity.entity;
            var box = entity.boundingBox, size = box.size, pos = box.origin;
            this.radius = Math.sqrt(Math.pow(size.width, 2) + Math.pow(size.height, 2)) / 2;
            this.rotation = entity.rotation;
            this.position.x = pos.x + size.width / 2;
            this.position.y = pos.y + size.height / 2;
        },
    });

    function VertexCircle() {

        VertexCircle.superclass.constructor.apply(this, arguments);
    }

    VertexCircle.inherit(cc.Node, {

        radius : 10,

        draw : function(ctx) {

            ctx.strokeStyle = "yellow";
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI*2, true); 
            ctx.stroke();
        },
    });

    function UILayer() {

        UILayer.superclass.constructor.apply(this, arguments)
        this.addChild(this.selectCircle = new SelectCircle);
        this.addChild(this.vertexCircle = new VertexCircle);
        this.vertexCircle.visible = false;

        App.global.bind("change:entity", this.entitySelectedChanged, this);
        App.global.bind("change:run", this.runChanged, this);
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

        isVertexCircleClicked : function() {

            return (this.vertexCircle.visible);
        },

        updateVertexCircle : function(point, nFix, nVert) {

            this.vertexCircle.visible = !!point;
            if (point) {
                this.vertexCircle.position = point;
                this.vertexCircle.nFix = nFix;
                this.vertexCircle.nVert = nVert;
            }
        },

        entityEnabledChanged : function(entity) {

            entity = entity || App.global.get("entity");
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

        isSelectCircleClicked : function(pos) {

            return (App.global.get("entity") && Math.abs(pos.dist(this.selectCircle.position)
                - this.selectCircle.radius) < 5 / this.scale);
        },
    })

    var GameView = Backbone.View.extend({

        el : $("#gameView"),
        dragging : { type : null, position : new cc.Point(0, 0), rotation : 0 },
        save : { entities : new App.EntityCollection, camera : new App.CameraModel },
        disabled : null,
        scene : null,
        uiLayer : null,
        gameLayer : null,
        mousemotion : 0,

        events : {

            "dragstart canvas" : "dragstart",
            "dragend canvas" : "dragend",
            "drag canvas" : "drag",
            "click canvas" : "click",
            "mousemove canvas" : "mousemove",
            "mousewheel canvas" : "wheel",
            "click #play" : "clickPlay",
            "click #stop" : "clickStop",
            "click #pause" : "clickPause",
            "click #camera" : "clickCamera",
            "click #entity" : "clickEntity",
        },

        initialize : function() {

            App.global.bind("change:entity", this.selectedEntityChanged, this);
            App.global.bind("change:level", this.levelChanged, this);

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

            if (App.global.get("run") == "play") return ;
            if (App.global.get("run") == "stop") {
                this.save.entities.reset();
                this.save.camera = App.global.get("level").get("camera").clone();
                App.global.get("level").get("entities").each(function(entity) {
                    entity.set("id", entity.get("id"));
                    var s = entity.deepClone(true);
                    this.save.entities.push(s);
                }.bind(this));
            }
            this.gameLayer.children.forEach(function(entity) {
                entity.body.SetAwake(true);
            })
            this.scene.scheduleUpdate();
            App.global.set("run", "play");
        },

        clickPause : function() {

            if (App.global.get("run") == "pause") return ;
            if (App.global.get("run") == "stop")
                this.clickPlay();
            var opts = { silent : true };
            this.scene.unscheduleUpdate();
            this.gameLayer.children.forEach(function(entity) {
                entity.model.set("position", cc.ccp(entity.position.x, entity.position.y), opts);
                entity.model.set("rotation", entity.rotation, opts);
                entity.model.change();
            });
            App.global.set("run", "pause");
        },

        clickStop : function() {

            if (App.global.get("run") == "stop") return ;
            this.scene.unscheduleUpdate();
            if (!App.global.get("level")) return ;
            var camera = App.global.get("level").get("camera");
            camera.attributes = this.save.camera.attributes;
            camera.trigger("change", camera, {});
            App.global.get("level").get("entities").each(function(model) {
                model.attributes = this.save.entities._byId[model.get("id")].attributes;
                var entity = model.entity, type = null;
                if (!model.entity) return;
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
            if (App.global.get("entity"))
                App.global.get("entity").trigger("change", App.global.get("entity"), {});
            App.global.set("run", "stop");
        },

        clickCamera : function() {

            App.global.set("mode", "camera");
        },

        clickEntity : function() {

            App.global.set("mode", "entity");
        },

        mousemove : function(e) {

            var entity = App.global.get("entity");
            if (!entity || ++this.mousemotion % 2) return;
            entity = entity.entity;
            var s = cc.Point.fromSize(entity.contentSize).scale(0.5),
                pos = entity.convertToNodeSpace(cc.Point.fromEvent(e).flipY()).sub(s),
                circle = this.uiLayer.vertexCircle, point = null, nVert = -1, nFix = -1;
            for (var fixture = entity.body.GetFixtureList(), i = 0; fixture; fixture = fixture.GetNext(), ++i)
                if (fixture.GetShape().GetType() == b2Shape.e_polygonShape)
                    _.each(fixture.GetShape().GetVertices(), function(vertex, j) {
                        if (pos.dist(cc.Point.fromB2(vertex, 30 / entity.scale)) < 10 / entity.scale
                            && (this.dragging.type != "vertex" || (circle.nVert == j && circle.nFix == i)))
                            point = this.transformPointEvent(e), nVert = j, nFix = i;
                    }, this);
            this.uiLayer.updateVertexCircle(point, nFix, nVert);
        },

        dragstart : function(e) {

            this.dragging.type = null;
            if (App.global.get("run") == "play") return ;
            if (App.global.get("mode") == "camera") {
                this.dragging.position = this.gameLayer.position.clone();
                this.dragging.type = "camera";
            } else if (App.global.get("mode") == "entity") {
                var position = this.transformPointEvent(e), entity = null;
                if (this.uiLayer.isVertexCircleClicked()) {
                    this.dragging.position = cc.Point.fromObject(App.global.get("entity").get("body").get("fixtures")
                        .at(this.uiLayer.vertexCircle.nFix).get("shape").at(this.uiLayer.vertexCircle.nVert).attributes);
                    this.dragging.type = "vertex";
                } else if (this.uiLayer.isSelectCircleClicked(position)) {
                    this.dragging.position = position;
                    this.dragging.type = "rotation";
                    this.dragging.rotation = App.global.get("entity").entity.rotation;
                } else if ((entity = App.global.get("entity"))) {
                    this.dragging.position = entity.entity.position.clone();
                    this.dragging.type = "entity";
                } else if ((entity = this.isEntityClicked(position))) {
                    this.dragging.position = entity.position.clone();
                    this.dragging.type = "entity";
                    App.global.set("entity", entity.model);
                }
            }
        },

        drag : function(e, a) {

            if (App.global.get("run") == "play") return ;
            var entity = App.global.get("entity");
            if (this.dragging.type == "vertex")
                entity.get("body").get("fixtures").at(this.uiLayer.vertexCircle.nFix).get("shape")
                    .at(this.uiLayer.vertexCircle.nVert).set(cc.Point.add(this.dragging.position, cc.ccp(a.deltaX, -a.deltaY)
                        .rotate(this.uiLayer.rotation).scale(1 / this.uiLayer.scale).rotate(entity.entity.rotation)
                        .scale(1 / entity.entity.scale).floor()));
            else if (this.dragging.type == "camera")
                App.global.get("level").get("camera").set("position", cc.Point.add(this.dragging.position,
                    cc.ccp(a.deltaX, -a.deltaY)).floor());
            else if (this.dragging.type == "rotation")
                entity.set("rotation", Math.floor(this.dragging.rotation -
                    cc.Point.sub(this.dragging.position, this.uiLayer.selectCircle.position)
                    .angle(cc.Point.sub(this.transformPointEvent(e), this.uiLayer.selectCircle.position))));
            else if (this.dragging.type == "entity")
                entity.set("position", cc.Point.add(this.dragging.position,
                    cc.ccp(a.deltaX, -a.deltaY).rotate(this.uiLayer.rotation).scale(1 / this.uiLayer.scale).floor()));
        },

        dragend : function() {

            this.dragging.type = null;
        },

        transformPointEvent : function(e) {

            return (this.uiLayer.convertToNodeSpace(cc.Point.fromEvent(e).flipY()));
        },

        click : function(e) {

            if (App.global.get("run") == "play") return ;
            var entity = this.isEntityClicked(this.transformPointEvent(e));
            App.global.set("entity", entity ? entity.model : null);                
        },

        wheel : function(e) {

            if (App.global.get("run") == "play")
                return (false);
            if (App.global.get("mode") == "camera")
                App.global.get("level").get("camera").set("scale", Math.floor(Math.range(this.uiLayer.scale
                    + e.originalEvent.wheelDeltaY * 0.0001, 0.1, 10) * 1000) / 1000);
            else if (App.global.get("mode") == "entity" && App.global.get("entity"))
                App.global.get("entity").set("scale", Math.floor(Math.range(App.global.get("entity").get("scale")
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
            if (model.hasChanged("scale"))
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

            // try {
                var fix = fixture.fixture;
                if (!fix) return ;
                var shape = fix.GetShape(), scale = fix.GetBody().entity.scale / 30;
                if (fixture.get("type") == b2Shape.e_circleShape)
                    shape.SetRadius(fixture.get("shape") * scale);
                else if (fixture.get("type") == b2Shape.e_polygonShape)
                    shape.SetAsVector(b2Vec2.verticesFromCollection(fixture.get("shape"), scale, fixture.get("position")));
            // }
            //  catch (e) {
            //     console.log(e, "when creating shape");
            // }
            // if (fixture.get("type") == b2Shape.e_polygonShape) {
            //     throw 42;
            //     console.log(shape.GetVertexCount(), shape.GetVertices(), fixture.get("shape"));
            // }
        },

        entityModelChanged : function(model) {

            var entity = model.entity;
            model = model.attributes;
            entity.setUrl(model.path);
        },

        vertexChanged : function(vertex, changed) {

            this.entityFixtureShapeChanged(vertex.fixture);
        },

        vertexAdded : function(vertex, vertices, init) {

            vertex.fixture = vertices.fixture;
            vertex.rebind("change", this.vertexChanged, this, init);
        },

        vertexRemoved : function(vertex, vertices) {

            this.entityFixtureShapeChanged(vertex.fixture);
            // fixes a bug from box2d (might create errors)
            vertex.fixture.fixture.GetShape().GetVertices().pop();
        },

        fixtureAdded : function(fixture, fixtures) {

            var fixdef = new b2FixtureDef;
            if (fixture.get("type") == b2Shape.e_circleShape) {
                fixdef.shape = new b2CircleShape(1);
                fixture.fixture = fixtures.body.CreateFixture(fixdef);
                fixture.rebind("change", this.entityFixtureChanged, this, true);
                fixture.rebind("change:shape", this.entityFixtureShapeChanged, this, true);
            } else if (fixture.get("type") == b2Shape.e_polygonShape) {
                fixdef.shape = b2PolygonShape.AsBox(1, 1);
                fixture.fixture = fixtures.body.CreateFixture(fixdef);
                fixture.get("shape").fixture = fixture;
                fixture.rebind("change", this.entityFixtureChanged, this);
                fixture.rebind("change:shape", this.entityFixtureShapeChanged, this);
                fixture.get("shape").rebind("add", this.vertexAdded, this, true);
                fixture.get("shape").rebind("remove", this.vertexRemoved, this);
            }
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
            model.rebind("change", this.entityChanged, this, true);
            model.rebind("change:enabled", this.entityEnabledChanged, this, true);
            model.get("body").rebind("change", this.entityBodyChanged, this, true);
            model.get("body").get("fixtures").rebind("add", this.fixtureAdded, this, true);
            model.get("body").get("fixtures").rebind("remove", this.fixtureRemoved, this);
            model.get("model").rebind("change", this.entityModelChanged, this, true);
            console.log("NEW ENTITY");
            this.clickPlay();
            this.clickStop();
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
