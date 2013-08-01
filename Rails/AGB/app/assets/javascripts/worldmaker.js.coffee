# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# LEVEL_MODEL                                               #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

kapp.model 'Level', ->
	name: null
	camera:
		position: x: 320, y: 240
		scale: 1
		rotation: 0
	entities: -> [ kapp.models.Entity() ]

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# ENTITY_MODEL                                              #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

kapp.model 'Entity', ->
	name: -> "entity" + _(app.scope.world.levels).fold 1, (mem, v) -> mem + v.entities.length
	enabled: true
	position: x: 0, y: 0
	scale: x: 1, y: 1
	rotation: 0
	model: kapp.models.Model()
	body: kapp.models.Body()

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# MODEL_MODEL                                               #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

kapp.model 'Model', ->
	enabled: true
	visible: true
	path: null

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# BODY_MODEL                                                #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

kapp.model 'Body', ->
	enabled: true
	visible: true
	type: '2' # dynamic
	fixtures: []

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# FIXTURE_MODEL                                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

kapp.model 'Fixture', ->
	position: x: 0, y: 0
	type: null
	density: 1
	friction: 0.5
	restitution: 0.5
	shape: null

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# CIRCLE_SHAPE_MODEL                                        #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

kapp.model 'CircleShape', ->
	radius: 10

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# POLYGON_SHAPE_MODEL                                       #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

kapp.model 'PolygonShape', ->
	vertices: [
		kapp.models.Vertex x: 10, y: 10
		kapp.models.Vertex x: -10, y: 10
		kapp.models.Vertex x: -10, y: -10
		kapp.models.Vertex x: 10, y: -10
	]

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# VERTEX_MODEL                                              #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

kapp.model 'Vertex', ->
	x: 0
	y: 0

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# APP_CONTROLLER                                            #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

app.controller 'WorldMakerController', ['$scope', '$location', '$http', ($scope, $location, $http) ->
	app.scope = $scope
	app.scaling = 30
	$scope.view_mode = 'camera'
	$scope.game_state = 'stop'

	$http.get("#{$location.path()}/world.json").success (data) ->
		log "world", data
		$scope.world = data
		$scope.world.levels = $scope.world.levels || []
		$scope.level = $scope.world.levels[0]
		$scope.entity = $scope.level?.entities[0]
	$scope.$watch 'level', -> $scope.entity = null if !$scope.level

	$scope.is_model = (obj, i) ->
		i[0] != '_' and i[0] != '$'

	$scope.save_world = ->
		$scope.saving = "saving..."
		world = _({}).deep_extend $scope.world, $scope.is_model
		$http.put("#{$location.path()}/world.json", world: world).success (data) ->
			$scope.saving = if data.error then "save failed!" else "successfully saved!" 
			_.delay (-> $scope.$apply -> $scope.saving = false), 2000

	$scope.key_actions = (e) ->
		return unless e.shiftKey and $scope.game_state != "playing"
		if e.keyCode == 78 and $scope.level
			$scope.entity = _($scope.level.entities).next($scope.entity)
		else if e.keyCode == 80 and $scope.level
			$scope.entity = _($scope.level.entities).prev($scope.entity)
		else if e.keyCode == 37 and $scope.entity
			--$scope.entity.position.x
		else if e.keyCode == 38 and $scope.entity
			++$scope.entity.position.y
		else if e.keyCode == 39 and $scope.entity
			++$scope.entity.position.x
		else if e.keyCode == 40 and $scope.entity
			--$scope.entity.position.y
]

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# LEVEL_CONTROLLER                                          #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

app.controller 'LevelController', ['$scope', '$location', '$http', ($scope, $location, $http) ->
	$scope.view = {level_over: {}, entity_over: {}}

	$scope.create_level = ->
		return $scope.error_level_name = "must not be blank" if !$scope.input_level_name
		return $scope.error_level_name = "must be unique" if _($scope.world.levels).findWhere name: $scope.input_level_name
		$scope.world.levels.push kapp.models.Level name: $scope.input_level_name

	$scope.delete_level = (level) ->
		$scope.world.levels = _.without $scope.world.levels, level

	$scope.select_level = (level) ->
		$scope.$parent.level = level

	$scope.create_entity = (level) ->
		level.entities.push kapp.models.Entity()

	$scope.delete_entity = (level, entity) ->
		level.entities = _(level.entities).without entity

	$scope.select_entity = (entity) ->
		$scope.$parent.entity = entity
]

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# MENU_CONTROLLER                                           #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

app.controller 'MenuController', ['$scope', ($scope) ->
	$scope.$watch 'mode', -> $scope.tab = $scope.mode
	$scope.$watch 'level', -> $scope.tab = if $scope.level then 'level' else 'classes'
	$scope.$watch 'entity', -> $scope.tab = if $scope.entity then 'entity' else 'classes' 
	$scope.body_types = '2': 'dynamic', '0': 'static', '1': 'kinematic'
	$scope.fixture_types = {}
	$scope.fixture_types[b2Shape.e_circleShape] = 'circle'
	$scope.fixture_types[b2Shape.e_polygonShape] = 'polygon'
	$scope.input_fixture_type = 'circle'
	$scope.models = [
		{name: 'ball', url: '/assets/ball.png'}
		{name: 'crate', url: '/assets/crate.jpg'}
	]

	$scope.toggle_layers = (layer_type) ->
		visible = !_($scope.level.entities).find (e) -> e[layer_type].visible
		_($scope.level.entities).each (e) -> e[layer_type].visible = visible

	$scope.create_fixture = ->
		model = _($scope.input_fixture_type).capitalize() + 'Shape'
		type = _($scope.fixture_types).invert()[$scope.input_fixture_type]
		$scope.entity.body.fixtures.push kapp.models.Fixture {shape: kapp.models[model](), type: +type}

	$scope.delete_fixture = (fixture) ->
		$scope.entity.body.fixtures = _($scope.entity.body.fixtures).without fixture

	$scope.create_vertex = (fixture) ->
		fixture.shape.vertices.push kapp.models.Vertex()

	$scope.delete_vertex = (fixture, vertex) ->
		fixture.shape.vertices = _(fixture.shape.vertices).remove vertex
]

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# CC Entity                                                 #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

Entity = ->
	Entity.superclass.constructor.apply(this, arguments)

Entity.inherit kge.Entity,
	is_angle_ok: (p1, p2, p3) ->
		angle = cc.Point.sub(p1, p2).angle(cc.Point.sub(p1, p3))
		angle < 0 and angle > -180

	is_polygon_ok: (vertices) ->
		idx = vertices.length - 1
		return false if idx < 2 or !@is_angle_ok(vertices[0], vertices[idx], vertices[1])
		for i in [1..idx - 1]
			return false if !@is_angle_ok(vertices[i], vertices[i - 1], vertices[i + 1])
		@is_angle_ok vertices[idx], vertices[idx - 1], vertices[0]

	draw_circle: (ctx, fixture, shape, size, scale) ->
		size = size.clone().add(cc.Point.fromB2(shape.m_p, app.scaling).scale(scale))
		ctx.lineWidth = 1 / @parent.scale
		ctx.arc(size.x, size.y, shape.GetRadius() * app.scaling, 0, 2 * Math.PI)
		ctx.moveTo(size.x, size.y)
		ctx.lineTo(size.x + shape.GetRadius() * app.scaling, size.y)
		ctx.strokeStyle = if fixture.highlighted then "yellow" else "#66FF66"

	draw_polygon: (ctx, fixture, shape, size, scale) ->
		return unless vertices = shape.GetVertices(); v = null
		ctx.strokeStyle = if fixture.highlighted then (if @is_polygon_ok(vertices) then 'yellow' else '#ff8000')
		else if @is_polygon_ok(vertices) then '#66FF66' else 'red'
		ctx.lineWidth = 1 / @parent.scale
		ctx.moveTov(v = cc.Point.scale(vertices[0], app.scaling).add(size))
		for i in [1..vertices.length - 1]
			ctx.lineTov(cc.Point.scale(vertices[i], app.scaling).add(size))
		ctx.lineTov(v)

Entity.prototype.draw = (ctx) ->
	if @model_entity.model.enabled and @model_entity.model.visible
		Entity.superclass.draw.apply @, arguments
	if @model_entity.body.enabled and @model_entity.body.visible
		scale = cc.Point.fromScale(@)
		size = cc.Point.fromSize(@contentSize).scale(scale).scale(0.5)
		fixture = @body.GetFixtureList()
		ctx.scale(1 / scale.x, 1 / scale.y)
		while fixture
			shape = fixture.GetShape()
			type = shape.GetType()
			ctx.beginPath()
			if type == b2Shape.e_circleShape
				@draw_circle ctx, fixture, shape, size, scale
			else if type == b2Shape.e_polygonShape
				@draw_polygon ctx, fixture, shape, size, scale
			ctx.stroke()
			fixture = fixture.GetNext()

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# CC SelectCircle                                           #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

SelectCircle = ->
	SelectCircle.superclass.constructor.apply this, arguments

SelectCircle.inherit cc.Node,
	radius: 40

	drawDashedCircle: (ctx, start, end, color) ->
		ctx.beginPath()
		ctx.arc(0, 0, @radius, start, end, false)
		ctx.strokeStyle = color
		ctx.stroke()

	drawDashedLine: (ctx, start, end, color) ->
		return unless end < @radius
		ctx.beginPath()
		ctx.moveTo(start, 0)
		ctx.lineTo(end, 0)
		ctx.strokeStyle = color
		ctx.stroke()

	draw: (ctx) ->
		n = @radius * @parent.scale; step = 2 * Math.PI / n / 1.5; start = -step; end = 0
		ctx.lineWidth = 2 / @parent.scale
		for i in [0..n]
			@drawDashedCircle ctx, start += step, end += step, 'white'
			@drawDashedCircle ctx, start += step, end += step, 'blue'
		n /= 6; start = 0; step = @radius / n / 1.5
		for i in [0..n]
			@drawDashedLine ctx, start, start += step, 'white'
			@drawDashedLine ctx, start, start += step, 'blue'

	update: (entity) ->
		@rotation = entity.rotation
		@position.x = entity.position.x
		@position.y = entity.position.y

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# CC VertexCircle                                           #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

VertexCircle = ->
  VertexCircle.superclass.constructor.apply this, arguments

VertexCircle.inherit cc.Node,
  radius: 12,

  draw: (ctx) ->
    ctx.strokeStyle = "yellow";
    ctx.beginPath();
    ctx.arc(0, 0, @radius, 0, Math.PI*2, true); 
    ctx.stroke();

  update: (point) ->
    @visible = !!point
    return unless point
    @position = point

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# CC uiLayer                                                #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

uiLayer = ($scope) ->
	uiLayer.superclass.constructor.apply this, arguments
	@addChild @select_circle = new SelectCircle
	@addChild @vertex_circle = new VertexCircle
	@vertex_circle.visible = @select_circle.visible = false
	$scope.$watch 'game_state', (state) => @select_circle.visible = state != 'play'
	$scope.$watch 'entity', => @select_circle.visible = !!$scope.entity
	return

uiLayer.inherit cc.Layer,
	select_circle: null
	vertex_circle: null

	select_circle_clicked: (pos) ->
		Math.abs(pos.dist(@select_circle.position) - @select_circle.radius) < 5 / @scale

	entity_enabled_changed: (entity) ->
		return @select_circle.visible = false unless entity
		@select_circle.visible = entity.model_entity.enabled
		@select_circle.update entity if entity.model_entity.enabled		

	update: (entity) ->
		return unless entity
		@select_circle.update entity

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# GAME_CONTROLLER                                           #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

app.controller 'GameController', ['$scope', 'array', ($scope, array) ->
	@dragging = what: null, position: cc.ccp(0, 0), rotation: 0
	@mousemotion = 0
	@fixtures = []

	@entity_position_changed = =>
		return unless @entity
		@entity.position.x = @entity.model_entity.position.x
		@entity.position.y = @entity.model_entity.position.y
		@entity.body.SetPosition @entity.position.toB2 app.scaling

	@entity_scale_changed = =>
		return unless @entity
		@entity.scaleX = @entity.model_entity.scale.x;
		@entity.scaleY = @entity.model_entity.scale.y;
		@entity_body_changed()

	@entity_rotation_changed = =>
		return unless @entity
		@entity.rotation = @entity.model_entity.rotation
		@entity.body.SetAngle cc.degreesToRadians -@entity.rotation

	@entity_enabled_changed = =>
		return unless @entity
		@disabled[@entity.name] = @entity
		@game_layer.removeChild {child: @entity, cleanup: false}
		if @entity.model_entity.enabled
			@disabled = _(@disabled).remove @entity
			@game_layer.addChild @entity

	@entity_model_changed = =>
		return unless @entity
		@entity.setUrl @entity.model_entity.model.path

	@entity_body_changed = =>
		return unless @entity
		@fixtures = []
		@entity.model_entity.body.fixtures = @entity.model_entity.body.fixtures || []
		@scene.world.DestroyBody(@entity.body) if @entity.body
		if @entity.model_entity.body.enabled
			@entity.body = @scene.world.CreateBody new b2BodyDef
			@entity.body.SetType +@entity.model_entity.body.type
			@fixture_added fixture for fixture in @entity.model_entity.body.fixtures
			@entity.body.SetPositionAndAngle(@entity.position.toB2(app.scaling), cc.degreesToRadians(-@entity.rotation))

	@entity_added = (model_entity) =>
		game_entity = model_entity.$game_entity = new Entity
		game_entity.model_entity = model_entity
		prev_entity = @entity
		@entity = game_entity
		@entity_body_changed()
		@entity_enabled_changed()
		@entity_position_changed()
		@entity_scale_changed()
		@entity_rotation_changed()
		@entity_model_changed()
		@entity = prev_entity

	@entity_removed = (model_entity) =>
		@game_layer.removeChild {child: model_entity.$game_entity, cleanup: true}

	@fixture_changed = (fixture_model, game_fixture) =>
		shape_model = fixture_model.shape
		shape = game_fixture.GetShape()
		scale = cc.Point.fromScale(@entity).scale(1 / app.scaling)
		if fixture_model.type == b2Shape.e_circleShape
			shape.SetRadius shape_model.radius * scale.x
			game_fixture.GetShape().m_p = cc.Point.fromObject(fixture_model.position).toB2(app.scaling)
		else if fixture_model.type == b2Shape.e_polygonShape
			shape.SetAsVector(b2Vec2.verticesFromArray(shape_model.vertices, scale, fixture_model.position))
		game_fixture.SetDensity fixture_model.density
		game_fixture.SetFriction fixture_model.friction
		game_fixture.SetRestitution fixture_model.restitution

	@fixture_added = (fixture_model) =>
		fixdef = new b2FixtureDef
		fixdef.density = 1
		if fixture_model.type == b2Shape.e_circleShape
			fixdef.shape = new b2CircleShape 0.1
		else if fixture_model.type == b2Shape.e_polygonShape
			fixdef.shape = b2PolygonShape.AsBox 0.1, 0.1
		game_fixture = @entity.body.CreateFixture(fixdef)
		@fixtures.push {model: fixture_model, game: game_fixture}
		@fixture_changed fixture_model, game_fixture

	cc.Director.sharedDirector.attachInView $('#canvas-view')[0]
	@scene = new kge.DynamicScene app.scaling
	@scene.addChild {child: @game_layer = new cc.Layer, z: 0}
	@scene.addChild {child: @ui_layer = new uiLayer($scope), z: 1}
	cc.Director.sharedDirector.runWithScene @scene

	$scope.$watch 'level', =>
		@disabled = {}
		@game_layer.removeChildren cleanup: true
		$scope.$parent.game_state = 'stop'

	array.$watch $scope, 'level.entities', @entity_added, @entity_removed

	$scope.$watch 'level.camera', ((v) =>
		return unless v
		@game_layer.position.x = @ui_layer.position.x = v.position.x
		@game_layer.position.y = @ui_layer.position.y = v.position.y
		@game_layer.rotation = @ui_layer.rotation = v.rotation
		@game_layer.scale = @ui_layer.scale = v.scale
	), true

	$scope.$watch 'entity', =>
		@entity = $scope.entity?.$game_entity
		$scope.view_mode = if $scope.entity then 'entity' else 'camera'

	$scope.$watch 'entity.enabled', =>
		@entity_enabled_changed()
		@ui_layer.entity_enabled_changed @entity

	$scope.$watch 'entity.model', (
		=> @entity_model_changed()
	), true

	$scope.$watch 'entity.position', (=>
		@entity_position_changed()
		@ui_layer.update @entity
	), true

	$scope.$watch 'entity.rotation', =>
		@entity_rotation_changed()
		@ui_layer.update @entity

	$scope.$watch 'entity.scale', (=> @entity_scale_changed()), true

	$scope.$watch 'entity.body', (=> @entity_body_changed()), true

	@entity_clicked = (position) =>
		_(@game_layer.children).find_if (entity) ->
			return true if cc.rectContainsPoint entity.boundingBox, position
			fixture = entity.body.GetFixtureList()
			while fixture
				return true if fixture.TestPoint(position.toB2(app.scaling))
				fixture = fixture.GetNext()
			false

	@fixture_clicked = (position) =>
		fixture = @entity.body.GetFixtureList()
		n_fixture = @entity.body.m_fixtureCount - 1
		while fixture
			return n_fixture if fixture.TestPoint(position.toB2(app.scaling))
			fixture = fixture.GetNext()
			--n_fixture
		n_fixture

	@transform_event_point = (e) =>
		@ui_layer.convertToNodeSpace cc.Point.fromEvent(e).flipY()

	@game_play = (before) ->
		@save = _({}).deep_extend $scope.level, $scope.is_model if before == 'stop'
		@game_layer.children.forEach (entity) -> entity.body.SetAwake true
		cc.Director.sharedDirector.displayFPS = true
		@scene.scheduleUpdate()

	@game_pause = (before) ->
		return @save = _({}).deep_extend $scope.level, $scope.is_model if before == 'stop'
		cc.Director.sharedDirector.displayFPS = false
		@scene.unscheduleUpdate()
		_($scope.level.entities).each (model_entity, i) => kapp.$apply $scope, =>
			game_entity = model_entity.$game_entity
			position = game_entity.position.clone().round()
			model_entity.position.x = position.x
			model_entity.position.y = position.y
			model_entity.rotation = game_entity.rotation

	@game_stop = (before) ->
		return if !before || before == 'stop'
		cc.Director.sharedDirector.displayFPS = false
		@scene.unscheduleUpdate()
		_($scope.level.camera).deep_extend @save.camera
		_($scope.level.entities).each (model_entity, i) => kapp.$apply $scope, =>
			game_entity = model_entity.$game_entity
			saved_entity = @save.entities[i]
			model_entity.position.x = saved_entity.position.x
			model_entity.position.y = saved_entity.position.y
			model_entity.rotation = saved_entity.rotation			
			prev_entity = @entity
			@entity = game_entity
			@entity_position_changed()
			@entity_rotation_changed()
			game_entity.body.ResetMassData()
			game_entity.body.SetLinearVelocity new b2Vec2(0,0)
			game_entity.body.SetAngularVelocity 0
			@entity = prev_entity

	$scope.$watch 'game_state', (now, before) => @["game_#{now}"] before

	$scope.wheel = (e) ->
		return false if $scope.game_state == 'play'
		if $scope.view_mode == 'camera'
			$scope.level.camera.scale = Math.range(Math.precise($scope.level.camera.scale + e.originalEvent.wheelDeltaY / 1000, 2), 0.1, 10)
		else if $scope.view_mode == 'entity' and $scope.entity
			$scope.entity.scale.x = Math.range(Math.precise($scope.entity.scale.x + e.originalEvent.wheelDeltaY / 1000, 2), 0.1, 10)
			$scope.entity.scale.y = Math.range(Math.precise($scope.entity.scale.y + e.originalEvent.wheelDeltaY / 1000, 2), 0.1, 10)
		false

	$scope.click = (e) =>
		return unless $scope.game_state != 'play'
		app.scope.entity = @entity_clicked(this.transform_event_point e)?.model_entity

	$scope.mousemove = (e) =>
		return unless @entity and @dragging.what != "vertex" and ++@mousemotion % 2
		position = @transform_event_point e
		fixture = @entity.body.GetFixtureList()
		@ui_layer.vertex_circle.update null
		n_fixture = @entity.body.m_fixtureCount - 1
		while fixture
			if fixture.GetShape().GetType() == b2Shape.e_polygonShape
				for vertex, n_vertex in fixture.GetShape().GetVertices()
					vertex_position = cc.Point.fromB2(vertex, app.scaling).rotate(-@entity.rotation).add(@entity.position)
					if position.dist(vertex_position) < 12
						@ui_layer.vertex_circle.update vertex_position
						@n_fixture = n_fixture
						@n_vertex = n_vertex
						return
			--n_fixture
			fixture = fixture.GetNext()
		return

	$scope.dragstart = (e) =>
		@dragging.what = null
		return unless $scope.game_state != 'play'
		if $scope.view_mode == 'camera'
			@dragging.position = @game_layer.position.clone()
			@dragging.what = 'camera'
		else if $scope.view_mode == 'entity'
			position = @transform_event_point e
			if e.shiftKey and ~@n_fixture_clicked = @fixture_clicked position
				@dragging.what = "fixture"
				@dragging.position = cc.Point.fromObject $scope.entity.body.fixtures[@n_fixture_clicked].position
			else if @ui_layer.vertex_circle.visible
				@dragging.what = "vertex"
				@dragging.position = cc.Point.fromObject $scope.entity.body.fixtures[@n_fixture].shape.vertices[@n_vertex]
			else if @ui_layer.select_circle_clicked position
				@dragging.position = position
				@dragging.what = "rotation"
				@dragging.rotation = $scope.entity.rotation
			else if entity = $scope.entity
				@dragging.position.x = entity.position.x
				@dragging.position.y = entity.position.y
				@dragging.what = "entity"
		return

	$scope.drag = (e, a) =>
		return unless $scope.game_state != 'play'
		if @dragging.what == "camera"
			$scope.level.camera.position = cc.Point.add(@dragging.position, cc.ccp(a.deltaX, -a.deltaY)).floor().toObject()
		else if @dragging.what == "fixture"
			fixture = $scope.entity.body.fixtures[@n_fixture_clicked]
			fixture.position = cc.Point.add(@dragging.position, cc.ccp(a.deltaX, -a.deltaY).rotate(@ui_layer.rotation)
			.scale(1 / @ui_layer.scale).rotate(@entity.rotation).scale(1 / @entity.scale).floor()).toObject()
		else if @dragging.what == "vertex"
			pos = cc.Point.add(@dragging.position, cc.ccp(a.deltaX, -a.deltaY).rotate(@ui_layer.rotation)
			.scale(1 / @ui_layer.scale).rotate(@entity.rotation).scale(1 / @entity.scale).floor())
			fixture = $scope.entity.body.fixtures[@n_fixture]
			vertex = fixture.shape.vertices[@n_vertex]
			vertex.x = pos.x; vertex.y = pos.y
			@ui_layer.vertex_circle.update pos.add(fixture.position).rotate(-@entity.rotation).add(@entity.position)
		else if @dragging.what == "rotation"
			$scope.entity.rotation = Math.floor(@dragging.rotation -
			cc.Point.sub(@dragging.position, @ui_layer.select_circle.position)
			.angle(cc.Point.sub(@transform_event_point(e), @ui_layer.select_circle.position)))
		else if @dragging.what == "entity"
			$scope.entity.position = cc.Point.add(@dragging.position,
			cc.ccp(a.deltaX, -a.deltaY).rotate(@ui_layer.rotation).scale(1 / @ui_layer.scale).floor()).toObject()
		return

	$scope.dragend = (e) =>
		@dragging.what = null

	$scope.$parent.highlight_fixture = (fixture, bool) =>
		if fixture = _(@fixtures).find_where(model: fixture)
			fixture.game.highlighted = bool
]