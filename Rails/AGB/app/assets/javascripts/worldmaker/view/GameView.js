define(["class", "kGE/kge", "model/LevelModel"], function(Class, kge, App) {

    window.kge = kge;

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

            var scaling = App.get("scaling");
            if (this.model.get("model").get("shown"))
                Entity.superclass.draw.apply(this, arguments);
            if (this.model.get("body").get("shown"))
                for (var fixture = this.body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
                    var shape = fixture.GetShape(), type = shape.GetType(), size = cc.Point.fromSize(this.contentSize).scale(0.5),
                        scale = cc.Point.fromScale(this);
                    ctx.beginPath();
                    ctx.scale(1 / scale.x, 1 / scale.y);
                    if (type == b2Shape.e_circleShape) {
                        size.add(shape.m_p).scale(scaling);
                        ctx.lineWidth = 1 / this.parent.scale;
                        ctx.arc(size.x, size.y, shape.GetRadius() * scaling, 0, 2 * Math.PI);
                        ctx.strokeStyle = fixture.highlighted ? "yellow" : "#66FF66";
                        ctx.moveTov(fixture.GetMassData().center);
                        ctx.lineTo(shape.GetRadius() * scaling, 0);
                    } else if (type == b2Shape.e_polygonShape) {
                        var vertices = shape.GetVertices(), v = null;
                        ctx.strokeStyle = fixture.highlighted ? "yellow" :
                            this.isPolygonConvexAndCCW(vertices) ? "#66FF66" : "red";
                        ctx.lineWidth = 1 / this.parent.scale;
                        ctx.moveTov(v = cc.Point.scale(vertices[0], scaling).add(size));
                        for (var i = 1; i < vertices.length; ++i)
                            ctx.lineTov(cc.Point.scale(vertices[i], scaling).add(size));
                        ctx.lineTov(v);
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

            var entity = App.get("entity");
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
        this.selectCircle.visible = false;

        App.bind("change:entity", this.entitySelectedChanged, this);
        App.bind("change:run", this.runChanged, this);
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

            entity = entity || App.get("entity");
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

            return (App.get("entity") && Math.abs(pos.dist(this.selectCircle.position)
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

            $("body").keydown(this.keydown.bind(this));
            App.bind("change:entity", this.selectedEntityChanged, this);
            App.bind("change:level", this.levelChanged, this);
            App.bind("change:highlightedFixture", this.highlightFixture, this);

            cc.Director.sharedDirector.attachInView(document.getElementById("canvasView"));
            this.scene = new kge.DynamicScene(App.get("scaling"));
            this.gameLayer = new cc.Layer;
            this.scene.addChild({ child : this.gameLayer, z : 0 });
            this.uiLayer = new UILayer;
            this.scene.addChild({ child : this.uiLayer, z : 1 });
            cc.Director.sharedDirector.runWithScene(this.scene);

            // this.debug();
            // this.logDebug = true;
        },

        debug : function() {

            var debugDraw = new b2DebugDraw(), ctx = $("#debug canvas")[0].getContext("2d");
            $("#debug").show();
            debugDraw.SetSprite(ctx);
            $("#debug").css("top", this.$("canvas").offset().top).css("left", this.$("canvas").offset().left - 10);
            ctx.translate(300, -300);
            debugDraw.SetDrawScale(App.get("scaling"));
            debugDraw.SetFillAlpha(0.5);
            debugDraw.SetLineThickness(1.0);
            debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit
                | b2DebugDraw.e_pairBit | b2DebugDraw.e_centerOfMassBit | b2DebugDraw.e_controllerBit);
            this.scene.world.SetDebugDraw(debugDraw);
            this.scene.debug = true;
        },

        highlightFixture : function(global, highlightedFixture) {

            var prev = global.previous("highlightedFixture");
            if (highlightedFixture)
                highlightedFixture.fixture.highlighted = true;
            if (prev)
                prev.fixture.highlighted = false;
        },

        migrate : function() {

            var level = App.get("level");
            if (!level) return;
            this.save.entities.reset();
            this.save.camera = level.get("camera").clone();
            level.get("entities").each(function(entity) {
                this.save.entities.push(entity.deepClone());
            }.bind(this));
        },

        clickPlay : function() {

            if (App.get("run") == "play") return ;
            if (App.get("run") == "stop")
                this.migrate();
            this.gameLayer.children.forEach(function(entity) {
                entity.body.SetAwake(true);
            });
            cc.Director.sharedDirector.displayFPS = true;
            this.scene.scheduleUpdate();
            App.set("run", "play");
        },

        updateEntities : function() {

            App.get("level").get("entities").each(function(entity) {
                entity.set({ position : entity.entity.position.clone().round(),
                    rotation : Math.precise(entity.entity.rotation, 3) });
            });
        },

        clickPause : function() {

            if (App.get("run") == "pause") return ;
            if (App.get("run") == "stop")
                this.clickPlay();
            cc.Director.sharedDirector.displayFPS = false;
            this.scene.unscheduleUpdate(); 
            this.updateEntities();
            App.set("run", "pause");
        },

        clickStop : function() {

            if (App.get("run") == "stop") return ;
            cc.Director.sharedDirector.displayFPS = false;
            this.scene.unscheduleUpdate();
            if (!App.get("level")) return ;
            this.updateEntities();
            App.get("level").get("camera").set(this.save.camera.attributes);
            App.get("level").get("entities").each(function(model) {
                var save = this.save.entities._byId[model.get("id")], entity = model.entity;
                if (!entity || !save) return;
                this.rollback(model, save);
                entity.body.ResetMassData();
                entity.body.SetLinearVelocity(new b2Vec2(0,0));
                entity.body.SetAngularVelocity(0);
            }.bind(this));
            App.set("run", "stop");
        },

        rollback : function(model, save) {

            _.each(save.attributes, function(value, key) {
                if (value instanceof Backbone.Model)
                    this.rollback(model.get(key), value);
                else if (value instanceof Backbone.Collection)
                    model.get(key).clear().concat(value);
                else
                    model.set(key, value);
            }, this);
        },

        clickCamera : function() {

            App.set("mode", "camera");
        },

        clickEntity : function() {

            App.set("mode", "entity");
        },

        mousemove : function(e) {

            var model = App.get("entity"), entity = null;
            if (!model || ++this.mousemotion % 2) return;
            entity = model.entity;
            var s = cc.Point.fromSize(entity.contentSize).scale(0.5),
                pos = entity.convertToNodeSpace(cc.Point.fromEvent(e).flipY()).sub(s),
                circle = this.uiLayer.vertexCircle, point = null, nVert = -1, nFix = -1;
            model.get("body").get("fixtures").each(function(fixture) {
                if (fixture.get("type") == b2Shape.e_polygonShape)
                    fixture.get("shape").each(function(vertex, i) {
                        vertex = fixture.fixture.GetShape().GetVertices()[i];
                        if (pos.dist(cc.Point.fromB2(vertex, App.get("scaling")).div(entity.scale)) < 10
                            && (this.dragging.type != "vertex" || (circle.nVertex == i && circle.fixture == fixture)))
                            point = this.transformPointEvent(e), nFix = fixture, nVert = i;
                    }, this);
            }, this);
            this.uiLayer.updateVertexCircle(point, nFix, nVert);
        },

        dragstart : function(e) {

            this.dragging.type = null;
            if (App.get("run") == "play") return ;
            if (App.get("mode") == "camera") {
                this.dragging.position = this.gameLayer.position.clone();
                this.dragging.type = "camera";
            } else if (App.get("mode") == "entity") {
                var position = this.transformPointEvent(e), entity = null;
                if (this.uiLayer.isVertexCircleClicked()) {
                    this.dragging.position = cc.Point.fromObject(this.uiLayer.vertexCircle.nFix
                        .get("shape").at(this.uiLayer.vertexCircle.nVert).attributes);
                    this.dragging.type = "vertex";
                } else if (this.uiLayer.isSelectCircleClicked(position)) {
                    this.dragging.position = position;
                    this.dragging.type = "rotation";
                    this.dragging.rotation = App.get("entity").entity.rotation;
                } else if ((entity = App.get("entity"))) {
                    this.dragging.position = entity.entity.position.clone();
                    this.dragging.type = "entity";
                } else if ((entity = this.isEntityClicked(position))) {
                    this.dragging.position = entity.position.clone();
                    this.dragging.type = "entity";
                    App.set("entity", entity.model);
                }
            }
        },

        drag : function(e, a) {

            if (App.get("run") == "play") return ;
            var entity = App.get("entity");
            if (this.dragging.type == "vertex")
                this.uiLayer.vertexCircle.nFix.get("shape").at(this.uiLayer.vertexCircle.nVert).set(cc.Point
                    .add(this.dragging.position, cc.ccp(a.deltaX, -a.deltaY).rotate(this.uiLayer.rotation)
                    .scale(1 / this.uiLayer.scale).rotate(entity.entity.rotation).scale(1 / entity.entity.scale).floor()));
            else if (this.dragging.type == "camera")
                App.get("level").get("camera").set("position", cc.Point.add(this.dragging.position,
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

            if (App.get("run") == "play") return ;
            var entity = this.isEntityClicked(this.transformPointEvent(e));
            App.set("entity", entity ? entity.model : null);                
        },

        wheel : function(e) {

            if (App.get("run") == "play")
                return (false);
            if (App.get("mode") == "camera")
                App.get("level").get("camera").set("scale", Math.precise(Math.range(this.uiLayer.scale
                    + e.originalEvent.wheelDeltaY * 0.0001, 0.1, 10.0), 3));
            else if (App.get("mode") == "entity" && App.get("entity"))
                App.get("entity").set("scale", cc.ccp(Math.precise(Math.range(App.get("entity").get("scale").x
                    + e.originalEvent.wheelDeltaY * 0.0001, 0.1, 10.0), 3), Math.precise(Math.range(App
                    .get("entity").get("scale").y + e.originalEvent.wheelDeltaY * 0.0001, 0.1, 10.0), 3)));
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

        entityChanged : function(model, init) {

            if (this.logDebug)
                log("entityChanged");
            var entity = model.entity, data = model.attributes;
            entity.id = data.id;
            entity.position = data.position.clone();
            entity.scaleX = data.scale.x;
            entity.scaleY = data.scale.y;
            entity.rotation = data.rotation;
            if (model.hasChanged("scale"))
                data.body.get("fixtures").each(function(fixture) {
                    this.entityFixtureChanged(fixture);
                }.bind(this));
            entity.body.SetPositionAndAngle(entity.position.toB2(App.get("scaling")), cc.degreesToRadians(-entity.rotation));
        },

        entityEnabledChanged : function(entity) {

            var data = entity.attributes;

            if (this.logDebug)
                log("entityEnabledChanged");
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

            if (this.logDebug)
                log("entityBodyChanged");
            var entity = body.entity;
            body = body.attributes;
            entity.body.SetType(body.type);
        },

        entityFixtureChanged : function(fixture, changes, init) {

            if (this.logDebug)
                log("entityFixtureChanged");
            var fix = fixture.fixture, entity = fix.GetBody().entity;
            if (fixture.get("type") == b2Shape.e_circleShape)
                fix.GetShape().m_p = fixture.get("position").toB2(App.get("scaling"));
            fix.SetDensity(fixture.get("density"));
            fix.SetFriction(fixture.get("friction"));
            fix.SetRestitution(fixture.get("restitution"));
            var aabb = fix.GetAABB(), shape = fix.GetShape(),
                scale = cc.Point.fromScale(fix.GetBody().entity).scale(1 / App.get("scaling"));
            // shape.ComputeAABB(aabb, fix.GetBody().GetTransform());
            // if (!Math.inRange(Math.abs(aabb.lowerBound.x - aabb.upperBound.x), 0.1, 100)
            //     || !Math.inRange(Math.abs(aabb.upperBound.y - aabb.lowerBound.y), 0.1, 100))
            //     console.debug("NOT IN RANGE", fix.GetBody().entity.id);
            if (fixture.get("type") == b2Shape.e_circleShape)
                shape.SetRadius(fixture.get("shape") * scale.x);
            else if (fixture.get("type") == b2Shape.e_polygonShape)
                shape.SetAsVector(b2Vec2.verticesFromCollection(fixture.get("shape"), scale, fixture.get("position")));
            entity.body.SetPositionAndAngle(entity.position.toB2(App.get("scaling")), cc.degreesToRadians(-entity.rotation));
        },

        fixtureAdded : function(fixture, fixtures) {

            if (this.logDebug)
                log("fixtureAdded");
            var fixdef = new b2FixtureDef;
            fixdef.density = 1;
            if (fixture.get("type") == b2Shape.e_circleShape) {
                fixdef.shape = new b2CircleShape(0.1);
                fixture.fixture = fixtures.body.CreateFixture(fixdef);
                fixture.rebind("change", this.entityFixtureChanged, this, true);
            } else if (fixture.get("type") == b2Shape.e_polygonShape) {
                fixdef.shape = b2PolygonShape.AsBox(0.1, 0.1);
                fixture.fixture = fixtures.body.CreateFixture(fixdef);
                fixture.get("shape").fixture = fixture;
                fixture.rebind("change", this.entityFixtureChanged, this);
                fixture.get("shape").rebind("add", this.vertexAdded, this, true);
                fixture.get("shape").rebind("remove", this.vertexRemoved, this);
            }
        },

        fixtureRemoved : function(fixture) {

            if (this.logDebug)
                log("fixtureRemoved");
            var body = fixture.fixtures ? fixture.fixtures.body : fixture.fixture.GetBody();
            body.DestroyFixture(fixture.fixture);
        },

        entityModelChanged : function(model) {

            var entity = model.entity;
            model = model.attributes;
            entity.setUrl(model.path);
        },

        vertexChanged : function(vertex, changed) {

            this.entityFixtureChanged(vertex.fixture);
        },

        vertexAdded : function(vertex, vertices, init) {

            vertex.fixture = vertices.fixture;
            vertex.rebind("change", this.vertexChanged, this, init);
            var shape = vertex.fixture.fixture.m_shape;
            shape.m_vertices = shape.m_vertices.slice(0, shape.GetVertexCount());
        },

        vertexRemoved : function(vertex, vertices) {

            this.entityFixtureShapeChanged(vertex.fixture);
            // fixes a bug from box2d (might create errors)
            vertex.fixture.fixture.GetShape().GetVertices().pop();
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

            if (this.logDebug)
                log("entityAdded", model.id, "{");
            var entity = new Entity, fixture = null;
            entity.body = this.scene.world.CreateBody(new b2BodyDef);
            entity.body.entity = entity;
            entity.model = model;
            model.entity = entity;
            model.get("model").entity = entity;
            model.get("body").entity = entity;
            model.get("body").get("fixtures").body = entity.body;
            model.rebind("change:enabled", this.entityEnabledChanged, this, true);
            model.rebind("change", this.entityChanged, this, true);
            model.get("body").rebind("change", this.entityBodyChanged, this, true);
            model.get("body").get("fixtures").rebind("add", this.fixtureAdded, this, true);
            model.get("body").get("fixtures").rebind("remove", this.fixtureRemoved, this);
            model.get("model").rebind("change", this.entityModelChanged, this, true);
            if (this.logDebug)
                log("}");
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

        keydown : function(e) {

            var key = e.keyCode, shift = e.shiftKey, level = App.get("level"),
                entity = App.get("entity"), levels = App.get("levels"), play = App.get("run") != "play";
            if (play && key == 81 && shift && level) {
                idx = entity ? level.get("entities").indexOf(entity) : level.get("entities").size(); 
                App.set("entity", level.get("entities").at(--idx < 0 ? level.get("entities").size() - 1 : idx));
            } else if (play && key == 69 && shift && level) {
                idx = entity ? App.get("level").get("entities").indexOf(App.get("entity")) : -1;
                App.set("entity", level.get("entities").at(++idx >= level.get("entities").size() ? 0 : idx));
            } else if (play && key == 37 && shift && App.get("entity")) {
                entity.set("position", cc.ccp(entity.get("position").x - 1, entity.get("position").y));
            } else if (play && key == 38 && shift && App.get("entity")) {
                entity.set("position", cc.ccp(entity.get("position").x, entity.get("position").y + 1));
            } else if (play && key == 39 && shift && App.get("entity")) {
                entity.set("position", cc.ccp(entity.get("position").x + 1, entity.get("position").y));
            } else if (play && key == 40 && shift && App.get("entity")) {
                entity.set("position", cc.ccp(entity.get("position").x, entity.get("position").y - 1));
            } else if (key == 83 && shift) {
                $("#save").click();
            } else if (key == 73 && shift) {
                this.$("#play").click();
            } else if (key == 79 && shift) {
                this.$("#stop").click();
            } else if (key == 80 && shift) {
                this.$("#pause").click();
            }
        },
	});

    new GameView;
});
