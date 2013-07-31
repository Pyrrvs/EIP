$ ->
	$('*[ng-app]').hide().css('visibility', 'visible').fadeIn(300)

@kapp = angular.module 'k-angular', []

# watch mutiple
kapp.$watch = (scope, listener, to_watch) ->
	scope[listener] = 0
	_(to_watch).each (e) -> scope.$watch e, -> ++scope[listener]

kapp.service 'array', ['$parse', ($parse) ->
	$watch: (scope, array, added_listener, removed_listener) ->
		oldValue = []
		newValue = null
		changeDetected = 0
		scope.$watch "#{array}.length", ->
			newValue = scope.$eval array
			_.chain(newValue).difference(oldValue).each added_listener
			_.chain(oldValue).difference(newValue).each removed_listener
			oldValue = _.extend [], newValue
]

kapp.run ['$rootScope', ($rootScope) ->
	kapp.scope = $rootScope
	_.extend $rootScope,
		redirect_to_if: (url, cond) ->
			$rootScope.redirect_to url if cond
		redirect_to: (url) ->
			$("body").fadeOut 100, -> window.location.href = url
		loading: 0
		log: log
		_: _
]

kapp.config ['$httpProvider', ($httpProvider) ->
	$httpProvider.responseInterceptors.push('myHttpInterceptor')
	$httpProvider.defaults.transformRequest.push (data) ->
		++kapp.scope.loading; data
]

kapp.factory 'myHttpInterceptor', [ '$q', ($q) ->
	(promise) ->
		promise.then(((response) -> --kapp.scope.loading; response),
			((response) -> --kapp.scope.loading; $q.reject(response)))
]

kapp.bind = (scope, prop, to_bind, deep = true) ->
	if _(to_bind).array()
		scope.$watch prop, ((v) -> kapp.extend(e, v) for e in to_bind), deep
	else
		scope.$watch prop, ((v) -> kapp.extend(to_bind, v)), deep

kapp.extend = (obj1, obj2) ->
	return obj1 if !obj2
	obj3 = {}
	for i, v of obj2
		if i.charAt(0) != '$' && i.substr(0, 2) != '$$'
			obj3[i] = v
	return _.deep_extend obj1, obj3

# messages over controllers
kapp.service 'messages', ->
	pop: (from, scope) ->
		messages = []
		@listeners[from] = scope
		(messages.push message; scope.$eval message.content if message.to == from) for message in @messages
		@messages = _(@messages).remove messages
	push: (to, content) -> @messages.push {to: to, content: content}
	instant: (to, content) -> @listeners[to].$eval content if @listeners[to]
	messages: []
	listeners: {}

kapp.$apply = (scope, action) -> if !scope.$$phase then scope.$apply action else scope.$eval action

kapp.model = (name, defaults) ->
	kapp.models = _(kapp.models).let {}
	kapp.models[name] = (properties) ->
		_.chain(defaults()).fold({}, (mem, v, k) -> mem[k] = (if _(v).func() then v() else v); mem).extend(properties).value()

kapp.config ["$httpProvider", ($httpProvider) ->
  $httpProvider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content')
]

kapp.factory 'app_scope', [ "$rootScope", ($rootScope) ->
	$rootScope.$$childHead
]

kapp.animation 'view-enter', ->
	start: (element, done) -> element.parent().parent().css("visibility", "inherit")

kapp.animation 'fade-in', ->
	start: (element, done) -> element.stop().hide().fadeIn(150, done)

kapp.animation 'fade-out', ->
	start: (element, done) -> element.stop().fadeOut(300, done)

kapp.animation 'fade-out-quick', ->
	start: (element, done) -> element.stop().fadeOut(150)

kapp.animation 'slow', ->
	start: (element, done) -> element.stop().hide().show("slow", done)

kapp.animation 'height-hide', ->
	start: (element, done) ->
		height = element.height()
		element.stop().animate({ height: 0 }, -> element.height(height); done())

kapp.animation 'height-show', ->
	start: (element, done) ->
		element.stop().height(0).animate({ height: height }) if height = element.height()

kapp.directive 'ngxValidate', ->
	require: 'ngModel'
	link: (scope, element, attrs, ctrl) ->
		validator =  ->
			validations = scope.$eval attrs.ngxValidate
			ctrl.$setValidity validation, value for validation, value of validations
		scope.$watch attrs.ngxValidateDependency, validator if attrs.ngxValidateDependency
		ctrl.$viewChangeListeners.push validator

kapp.directive 'ngxOffset', ->
	(scope, element, attrs) ->
		scope.$watch attrs.ngxOffset, (pos) ->
			element.offset pos

kapp.directive 'ngxTypeahead', ["$compile", ($compile) ->
	require: 'ngModel'
	link: (scope, element, attrs, ctrl) ->
		matcher = if attrs.ngxTypeaheadMatcher then scope.$eval attrs.ngxTypeaheadMatcher else (query, groups) ->
			_(groups).fold [], (mem_groups, group) -> 
				mem_groups.push _({}).extend(group, items: items) if (items = _(group.items).fold [], (mem_items, item) ->
					mem_items.push item if ~item.label.toLowerCase().indexOf(query?.toLowerCase()); mem_items).length
				mem_groups
		updater = if attrs.ngxTypeaheadUpdater then scope.$eval attrs.ngxTypeaheadUpdater else (query, group, item) -> item.label
		scope.$watch attrs.ngxTypeahead, (v) -> scope.source = v || []
		scope.pick = ->
			return unless scope.menu_shown
			scope.menu_shown = false
			ctrl.$setViewValue updater(ctrl.$modelValue || "", scope.group, scope.item)
			ctrl.$render()
		scope.select = (group, item) ->
			scope.group = group
			scope.item = item
		scope.lookup = ->
			scope.groups = matcher ctrl.$modelValue || "", scope.source, element
			return unless scope.groups and scope.groups.length
			scope.menu_shown = true
			scope.offset = element.offset()
			scope.offset.top += element.height() + element.get(0).offsetHeight - 15
			scope.item = _(scope.group.items).first() if scope.group = _(scope.groups).first()
		ctrl.$viewChangeListeners.push -> _(-> scope.$apply scope.lookup).defer()
		menu = $("<ul class='typeahead' style='position: absolute' ng-show='menu_shown'
			ngx-click-out='menu_shown = false' ngx-offset='offset'>
			<li ng-show='groups' ng-repeat='group in groups' ng-show='group.items.length'>
				<ul>
					<li class='group-name' ng-show='group.label'><a>{{group.label}}</a></li>
					<li class='item' ngx-active='item == it' ng-repeat='it in group.items' ng-click='pick()' ng-mouseenter='select(group, it)'>
						<a href>{{it.label}}</a>
					</li>
				</ul>
			</li>
		</ul>").insertAfter(element)
		$compile(menu)(scope)
		scroll = -> _(->
			$item = menu.find('.item.active')
			menu.scrollTop(0).scrollTop($item.offset().top - menu.offset().top - $item.height() * 3)
		).defer()
		element.on('keydown', (e) -> scope.$apply ->
			return unless scope.menu_shown
			switch e.keyCode
				when 9, 13, 27 then e.preventDefault()
				when 38 # arrowup
					return unless scope.groups and scope.group and scope.item
					if _(scope.group.items).is_first(scope.item)
						scope.group = _(scope.groups).prev(scope.group)
						scope.item = _(scope.group.items).last()
					else
						scope.item = _(scope.group.items).prev(scope.item)
					scroll()
					e.preventDefault()
				when 40 # arrowdown
					return unless scope.groups and scope.group and scope.item
					if _(scope.group.items).is_last(scope.item)
						scope.group = _(scope.groups).next(scope.group)
						scope.item = _(scope.group.items).first()
					else
						scope.item = _(scope.group.items).next(scope.item)
					scroll()
					e.preventDefault()
			e.stopPropagation()
		).on('keyup', (e) -> scope.$apply ->
			switch e.keyCode
				when 40, 38, 16, 17, 18 then null
				when 9, 13 # tab, enter
					scope.pick()
					e.stopPropagation()
				when 27 # escape
					if scope.menu_shown
						scope.menu_shown = false
						e.stopPropagation()
			scope.lookup() unless scope.menu_shown
			e.preventDefault()
		).focus -> kapp.$apply scope, scope.lookup
]

kapp.directive 'ngxEditableContent', ->
	require: 'ngModel'
	link: (scope, element, attrs, ctrl) ->
		ctrl.$render = -> element.html ctrl.$viewValue || ''
		element.bind 'blur keyup change', -> scope.$apply -> ctrl.$setViewValue element.html(); ctrl.$render()

kapp.directive 'ngxSubmit', ->
	require: 'form'
	link: (scope, element, attrs, ctrl) ->
		element.find('input[type="submit"], button').first().click ->
			return unless ctrl.$valid
			scope.$apply attrs.ngxSubmit
			if !_.undef attrs.ngxCloseModal
				(if attrs.ngxCloseModal then $(attrs.ngxCloseModal) else element.closest(".modal")).modal("hide")

kapp.directive 'ngxFirst', ->
	(scope, element, attrs) ->
		scope.$watch '$first', -> element.toggleClass attrs.ngxFirst || 'first', scope.$first

kapp.directive 'ngxLast', ->
	(scope, element, attrs) ->
		scope.$watch '$last', -> element.toggleClass attrs.ngxLast || 'last', scope.$last

kapp.directive 'ngxMiddle', ->
	(scope, element, attrs) ->
		scope.$watch '$middle', -> element.toggleClass attrs.ngxMiddle || 'middle', scope.$middle

kapp.directive 'ngxPosition', ->
	(scope, element, attrs) ->
		scope.$watch '$index', ->
			element.toggleClass("first", scope.$first).toggleClass("middle", scope.$middle).toggleClass("last", scope.$last)

kapp.directive 'ngxActive', ->
	(scope, element, attrs) ->
		scope.$watch attrs.ngxActive, (v) ->
			element.toggleClass 'active', !!v

kapp.directive 'ngxKeydown', ->
	(scope, element, attrs) ->
		$("body").keydown (e) -> scope.$apply -> scope.$event = e; scope.$eval attrs.ngxKeydown

kapp.directive 'ngxShortcut', ->
	(scope, element, attrs) ->
		[key, shift] = if match = /.*shift\+(.+)/g.exec attrs.ngxShortcut then [+match[1], true] else [+attrs.ngxShortcut, false]
		$("body").keydown (e) ->
			element.click() if e.keyCode == key && e.shiftKey == shift

kapp.directive 'ngxCollapse', ->
	(scope, element, attrs) ->
		element.addClass "collapse"
		scope.$watch attrs.ngxCollapse, (v) ->
			element.collapse('show') if v and !element.hasClass('in')
			element.collapse('hide') if !v and element.hasClass('in')

kapp.directive 'ngxDropdown', ->
	(scope, element, attrs) ->
		element.click -> element.parent().toggleClass "open"
		$(document).click (e) -> element.parent().removeClass "open" if !$(e.target).closest(element.parent()).length

kapp.directive 'ngxToggle', ->
	(scope, element, attrs) ->
		$el = if attrs.ngxToggle then _(element).$find(attrs.ngxToggle) else element
		$el.addClass "collapse"
		element.click -> $el.collapse "toggle"

kapp.directive 'ngxTest', ->
	(scope, element, attrs) ->
		log attrs.ngxTest

kapp.directive 'ngxForm', [ '$compile', '$http', '$parse', ($compile, $http, $parse) ->
	require: 'form'
	link: (scope, element, attrs, ctrl) ->
		ctrl.$data = {}
		ctrl.$errors = {}
		element.submit (e) -> e.preventDefault()
		form_name = attrs.name || attrs.id
		scope[form_name] = ctrl
		inputs = element.find('input[name]')
		resource_name = attrs.ngxResource || form_name.replace /(^new_|^edit_)/, ''
		element.find("input[type='submit']:not([ng-click]), button:not([ng-click])").first().click -> scope.$apply ->
			return unless ctrl.$valid
			http_settings = {method: attrs.ngxMethod or attrs.method or 'post', url: attrs.action, data: ctrl.$data}
			# log http_settings
			$http(http_settings).success (data) ->
				# log data
				if data.error
					_(data.error[resource_name]).each (error, field) ->
						# log [form_name], [resource_name], [field], [if _.array(error) then error[0] else error]
						ctrl.$errors[resource_name][field] = if _.array(error) then error[0] else error
				scope.$resp = data; scope.$eval attrs.ngxForm
		# log form_name, resource_name
		_(inputs).$each ->
			attr = @attr('name')
			if !attr.indexOf resource_name
				ctrl.$errors[resource_name] ||= {}
				ctrl.$data[resource_name] ||= {}
				attr = attr.substr(resource_name.length + 1)
				attr = attr.substr(0, attr.length - 1)
				attr = "#{resource_name}.#{attr}"
			@attr 'ngx-popover', "#{form_name}.$errors.#{attr}" if !@attr 'ngx-popover'
			@attr 'ng-model', "#{form_name}.$data.#{attr}" if !@attr 'ng-model'
			$compile(@) scope
]

kapp.directive 'ngxModelInit', ->
	require: '^?ngModel'
	priority: 1000
	link: (scope, element, attrs, ctrl) ->
		ctrl.$setViewValue element.val() if ctrl

kapp.directive 'ngxAccordionToggle', ->
	(scope, element, attrs) ->
		element.parent().next().collapse toggle: false
		if attrs.ngxAccordionToggle
			scope.$watch attrs.ngxAccordionToggle, ->
				element.click()
		element.click ->
			element.closest('.accordion').find("[ngx-accordion-toggle]").each (i, e) ->
				$(e).parent().next().collapse "hide"
			scope.$apply attrs.ngxAccordionToggleOn if attrs.ngxAccordionToggleOn && !element.parent().next().hasClass('in')
			scope.$apply attrs.ngxAccordionToggleOff if attrs.ngxAccordionToggleOff && element.parent().next().hasClass('in')
			element.parent().next().collapse("toggle")

kapp.directive 'ngxEllipsis', ->
	(scope, element, attrs) ->
		element.css
			'white-space': 'nowrap'
			'max-width': if attrs.ngxEllipsis then +attrs.ngxEllipsis else '150px'
			'text-overflow': 'ellipsis'
			'overflow': 'hidden'

kapp.directive 'ngxTrigger', ->
	(scope, element, attrs) ->
		event = attrs.ngxTrigger.split(" ")
		event_type = event.shift()
		event_target_type = event.shift()
		event_target = event.join(" ")
		element.on event_type, (e) -> $(event_target).trigger(event_target_type, e)

kapp.directive 'ngxEvent', ->
	(scope, element, attrs) ->
		event = attrs.ngxEvent.split(" ")
		event_type = event.shift()
		event_action = event.join(" ")
		element.on event_type, (e) -> scope.$apply -> scope.$event = e; scope.$eval event_action

kapp.directive 'ngxEvents', ->
	(scope, element, attrs) ->
		events = attrs.ngxEvents.split(" ")
		for event in events
			element.on(event, do (event, element) -> (e, a) ->
				scope.$apply -> scope.$event = e; scope.$attr = a; e.stopPropagation(); scope.$eval attrs["ngxOn#{_(event).capitalize()}"])

kapp.directive 'ngxClassOnover', ->
	(scope, element, attrs) ->
		element.on("mouseenter", -> element.addClass attrs.ngxClassOnover).on("mouseleave", -> element.removeClass attrs.ngxClassOnover)

kapp.directive 'ngxVisible', ->
	(scope, element, attrs) ->
		scope.$watch attrs.ngxVisible, (v) ->
			element.css visibility: if v then "visible" else "hidden"

kapp.directive 'ngxClickOut', ->
	(scope, element, attrs) ->
		$(document).click (e) ->
			if !$(e.target).closest(element).length && !$(e.target).closest(attrs.ngxClickOutExcept).length
				scope.$apply attrs.ngxClickOut

kapp.directive 'ngxFocus', ->
	(scope, element, attrs) ->
		scope.$watch attrs.ngxFocus, (v) -> _(-> element.focus()).defer() if v

kapp.directive 'ngxBlur', ->
	(scope, element, attrs) ->
		scope.$watch attrs.ngxBlur, (v) -> _(-> element.blur()).defer() if v

kapp.directive 'ngxSelectable', ->
	(scope, element, attrs) ->
		scope.$watch attrs.ngxSelectable, (v) ->
			if v then element.enableSelection() else element.disableSelection()

kapp.directive 'ngxDraggable', ->
	(scope, element, attrs) ->
		options =
			revert: "invalid"
			revertDuration: 200
			start: () -> element.css('z-index', '+=1'); angular.__draggable = scope.$eval attrs.ngxDraggable
			stop: () -> element.css('z-index', '-=1')
		element.draggable(options).disableSelection()

kapp.directive 'ngxDroppable', ->
	(scope, element, attrs) ->
		options =
			drop: -> scope.$apply -> scope.draggable = angular.__draggable; scope.$eval attrs.ngxDroppable
			activeClass: "droppable"
		if attrs.ngxDroppableAccept
			options.accept = -> scope.$apply -> scope.draggable = angular.__draggable; scope.$eval attrs.ngxDroppableAccept
		element.droppable(options).disableSelection()

kapp.directive 'ngxSortable', ->
	(scope, element, attrs) ->
		element.disableSelection().sortable
      containment: element.parent()
      forcePlaceholderSize: true
      tolerance: 'pointer'
      revert: true
    scope.$watch attrs.ngxSortable, (sortable) ->
      element.sortable if sortable then 'enable' else 'disable'

kapp.directive 'ngxFit', ->
	(scope, element, attrs) ->
		resize = -> 
			element.width(0).width(_(element.parent().find("> *")).fold 0, (res, e) ->
				res - _($(e)).totalWidth() - element.parent().width() -
				_(element.parent().css("paddingLeft")).pxToInt() -
				_(element.parent().css("paddingRight")).pxToInt())
		$(window).resize(resize)
		if attrs.ngxFit then scope.$watch attrs.ngxFit, resize else resize()

kapp.directive 'ngxModal', ->
	(scope, element, attrs) ->
		element.modal({ keyboard: true, show: false }).on("shown", ->
			scope.$apply "#{attrs.ngxModal} = true" if !scope.$$phase)
		.on("hidden", ->
			_(-> scope.$apply attrs.ngxModalClosed).defer() if attrs.ngxModalClosed
			scope.$apply "#{attrs.ngxModal} = false" if !scope.$$phase)
		scope.$watch attrs.ngxModal, (v) ->
			if v
				element.modal "show"
				scope.$eval "#{attrs.ngxModalShown}"
			else
				element.modal "hide"
				scope.$eval "#{attrs.ngxModalHidden}"

kapp.directive 'ngxModalFocus', ->
	(scope, element, attrs) ->
		element.closest(".modal").on "shown", -> element.focus()

kapp.directive 'ngxModalHeader', [ "$compile", ($compile) ->
	(scope, element, attrs) ->
		element.addClass 'modal-header'
		element.append "<button type='button' class='close' ngx-close-modal ngx-tooltip=\"'close'\" ngx-placement='left'
		ngx-move='0 3' aria-hidden='true'>&times;</button><span class='lead'>{{ #{attrs.ngxModalHeader} }}</span>"
		$compile(element.children()) scope
]

kapp.directive 'ngxCloseModal', ->
	(scope, element, attrs) ->
		element[if element.is 'form' then 'submit' else 'click'] ->
			(if attrs.ngxCloseModal then $(attrs.ngxCloseModal) else element.closest(".modal")).modal("hide")

kapp.directive 'ngxOpenModal', ->
	(scope, element, attrs) ->
		element.click ->
			(if attrs.ngxOpenModal then $(attrs.ngxOpenModal) else element.closest(".modal")).modal("show")

kapp.directive 'ngxLinkTo', [ "$location", ($location) ->
	(scope, element, attrs) ->
		link = if element.is("a") then element else element.find("> a").first()
		link.attr "href", "#/#{attrs.ngxLinkTo}"
		scope.$watch (-> $location.path()), ->
			element.toggleClass "active", link.attr("href") == "#" + $location.path() 
]

kapp.directive 'ngxPlacehold', ->
	(scope, element, attrs) ->
		[width, height] = attrs.ngxPlacehold?.split(" ")
		element.wrap $(document.createElement "div").width(width).height(height)
		.addClass("placeholder").css({ 'display': 'inline-block', 'vertical-align': 'middle' })
		element.bind 'load', ->
			element.unwrap()

kapp.directive 'ngxRadio', ->
	require: 'ngModel'
	link: (scope, element, attrs, ngModelCtrl) ->
		$buttons = element.find('> .btn')
		_($buttons).$each -> if !@.attr('ngx-value') then @.attr('ngx-value', "'#{@.attr('value') || @.text()}'")
		ngModelCtrl.$render = ->
			_($buttons).$each ->
				@.toggleClass 'active', angular.equals(ngModelCtrl.$modelValue, scope.$eval(@.attr 'ngx-value'))
		$buttons.click (e) ->
			scope.$apply ->
				ngModelCtrl.$setViewValue(scope.$eval($(e.target).attr 'ngx-value'))
				ngModelCtrl.$render()

kapp.directive 'ngxCheckbox', ->
	require: 'ngModel'
	link: (scope, element, attrs, ngModelCtrl) ->
		element.wrap('<div class="checkbox-wrapper"></div>').after('<span class="lbl"></span>')
		checked = false
		ngModelCtrl.$render = ->
			element[0].checked = ngModelCtrl.$viewValue
		element.click ->
			checked = element[0].checked
			_(-> scope.$apply -> ngModelCtrl.$setViewValue element[0].checked = checked).defer()

kapp.directive 'ngxSelect', ->
	(scope, element, attrs) ->
		element.wrap("<div class='select'></div>")

kapp.directive 'ngxEditable', [ "$compile", ($compile) ->
	(scope, element, attrs) ->
		id = attrs.id
		scope.view = _(scope.view).let {}
		element.find("button").attr 'ng-click', "view.editing_#{id} = true; view.input_#{id} = user.#{id}"
		element.wrapInner "<div ng-show='!view.editing_#{id}'></div>"
		element.append "<form ng-show='view.editing_#{id}' ngx-submit='#{attrs.ngxEditable}; view.editing_#{id} = false' class='edit-form'>
		<input type='text' ngx-focus='view.editing_#{id}' ng-model='view.input_#{id}'/><button ng-click='view.editing_#{id} = false'
		type='button' class='close' aria-hidden='true'>&times;</button></form>"
		$("body").keydown (e) -> scope.$apply "view.editing_#{id} = false" if e.keyCode == 27
		$compile(element.children()) scope
]

kapp.$tooltip = null
kapp.directive 'ngxTooltip', ->
	(scope, element, attrs) ->
		[l, t] = if attrs.ngxMove then attrs.ngxMove.split(" ") else [0, 0]
		[t, l] = [+t, +l]
		hover = false
		element.hover (->
			hover = true
			$('body').append kapp.$tooltip = $("<div style='position:absolute;z-index:9999;' class='tip'></div>").hide() if !kapp.$tooltip
			kapp.$tooltip.stop().show().text(scope.$eval attrs.ngxTooltip)
			tw = kapp.$tooltip[0].offsetWidth; th = kapp.$tooltip[0].offsetHeight;
			p = element.offset(); ew = element[0].offsetWidth; eh = element[0].offsetHeight
			pos = switch (placement = attrs.ngxPlacement || 'top')
				when 'bottom' then top: p.top + eh + 12 + t, left: p.left + ew / 2 - tw / 2 + l
				when 'top' then top: p.top - th - 12 + t, left:  p.left + ew / 2 - tw / 2 + l
				when 'left' then top: p.top + eh / 2 - th / 2 + t, left: p.left - tw - 12 + l
				when 'right' then top: p.top + eh / 2 - th / 2 + t, left: p.left + ew + 12 + l
			kapp.$tooltip.offset(pos).addClass(placement).hide().fadeIn(100)), ->
				hover = false; kapp.$tooltip.stop().show().fadeOut(100)
		element.on 'remove, $destroy', -> kapp.$tooltip.stop().show().fadeOut(100) if hover

kapp.directive 'ngxPopover', ->
	(scope, element, attrs) ->
		[l, t] = if attrs.ngxMove then attrs.ngxMove.split(" ") else [0, 0]
		[t, l] = [+t, +l]
		scope.$watch attrs.ngxPopover, (v) ->
			return if !v
			$popover = $("<div class='popover in' style='display:block;z-index:9999;'>
			<div class='arrow'></div><div class='popover-content'>#{v}</div></div>").hide()
			$('body').append $popover.show()
			tw = $popover[0].offsetWidth; th = $popover[0].offsetHeight;
			p = element.offset(); ew = element[0].offsetWidth; eh = element[0].offsetHeight
			pos = switch (placement = attrs.ngxPlacement || 'left')
				when 'bottom' then top: p.top + eh + 15 + t, left: p.left + ew / 2 - tw / 2 + l
				when 'top' then top: p.top - th - 15 + t, left:  p.left + ew / 2 - tw / 2 + l
				when 'left' then top: p.top + eh / 2 - th / 2 + t, left: p.left - tw - 15 + l
				when 'right' then top: p.top + eh / 2 - th / 2 + t, left: p.left + ew + 15 + l
			$popover.removeClass('bottom top left right').addClass(placement).offset(pos).hide().fadeIn()
			_(-> $popover.fadeOut(300, -> $popover.remove(); scope.$apply "#{attrs.ngxPopover} = null")).delay 2000

kapp.directive 'ngxAdmin', ->
	(scope, element, attrs) ->
		if attrs.ngxAdmin
			func = -> element.toggle !!(scope.admin && scope.$eval attrs.ngxAdmin)
			scope.$watch 'admin', func
			scope.$watch attrs.ngxAdmin, func
		else
			scope.$watch 'admin', -> element.toggle scope.admin

kapp.directive 'ngxHover', ->
	(scope, element, attrs) ->
		hover = (bool) -> kapp.$apply scope, "#{attrs.ngxHover} = #{bool}"
		element.hover((-> hover true), -> hover false).on 'remove', -> hover false

kapp.directive 'ngxPopFromBottom', ->
	(scope, element, attrs) ->
		bottom = element.css('bottom')
		height = element.height()
		element.css {bottom: -height - 10, opacity: 0}
		scope.$watch attrs.ngxPopFromBottom, (v) ->
			if v then element.stop().animate({bottom:bottom, opacity: 1}, 500)
			else element.stop().animate({bottom: -height - 10, opacity: 0}, 500)

kapp.directive 'ngxFade', ->
	(scope, element, attrs) ->
		speed = if attrs.ngxFadeSpeed then +attrs.ngxFadeSpeed else 300
		scope.$watch attrs.ngxFade, (v) ->
			if v then element.stop().fadeIn(speed) else element.stop().fadeOut(speed)

kapp.directive 'ngxScrollTop', ->
	(scope, element, attrs) ->
		$win = $(window).scroll -> scope.$apply "#{attrs.ngxScrollTop} = #{$win.scrollTop() > 20}"

kapp.directive 'ngxScrollDown', ->
	(scope, element, attrs) ->
		timer = null
		$win = $(window).scroll ->
			if !timer and $win.height() + $win.scrollTop() > $('html').height() - 100
				timer = scope.$apply attrs.ngxScrollDown
				setTimeout (-> clearTimeout timer; timer = null), 1500
		scope.$on '$destroy', -> $win.off 'scroll'; clearTimeout timer; timer = null

kapp.directive 'ngxScrollToTop', ->
	(scope, element, attrs) ->
		element.click -> $("html, body").animate scrollTop: 0

kapp.directive 'ngxScrollTo', ->
	(scope, element, attrs) ->
		($el = _(element).$parent ($el) -> $el.css("overflow-y") == "scroll")
		scope.$watch attrs.ngxScrollTo, (v) ->
			return scope.$eval "#{attrs.ngxScrollTo} = null" unless ($to = $(v)).length
			$el.scrollTop($to.addClass('scrolled-to').position().top - 100)

kapp.directive 'ngxOrder', ->
	(scope, element, attrs) ->
		scope.$watch '$first', -> element.toggleClass "first", scope.$first
		scope.$watch '$middle', -> element.toggleClass "middle", scope.$middle
		scope.$watch '$last', -> element.toggleClass "last", scope.$last

kapp.directive 'ngxParity', ->
	(scope, element, attrs) ->
		scope.$watch '$index', ->
			if scope.$index % 2 then element.addClass("odd").removeClass("even")
			else element.addClass("even").removeClass("odd")

kapp.directive 'ngxDisabled', ->
	(scope, element, attrs) ->
		scope.$watch attrs.ngxDisabled, (v) ->
			element.attr("disabled", !!v).toggleClass("disabled", !!v)

kapp.directive 'ngxAllDisabled', ->
	(scope, element, attrs) ->
		scope.$watch attrs.ngxAllDisabled, (v) ->
			element.find("*").attr("disabled", !!v).toggleClass("disabled", !!v)

kapp.directive 'ngxTab', ->
	(scope, element, attrs) ->
		scope.$watch attrs.ngxTab, (v) -> element.find("[ngx-tab-pane]").each ->
			$e.tab("show") if ($e = $(@)).attr("ngx-tab-value") == v || $e.text() == v

kapp.directive 'ngxTabPane', ->
	(scope, element, attrs) ->
		element.attr("data-target", attrs.ngxTabPane).attr("data-toggle", "tab").on "shown", ->
			tab = element.closest('[ngx-tab]').attr('ngx-tab')
			value = element.attr("ngx-tab-value") || element.text()
			kapp.$apply scope, "#{tab} = '#{value}'"

kapp.directive 'ngxTabOn', ->
	(scope, element, attrs) ->
		scope.$watch attrs.ngxTabOn, (v) ->
			return unless value = (if v then element.attr("ngx-tab-value") || element.text() else attrs.ngxTabOff)
			tab = element.closest("[ngx-tab]").attr("ngx-tab")
			scope.$eval "#{tab} = '#{value}'"

kapp.filter 'stroke', ->
	(input, nb) ->
		return "" if !input
		if input.length > nb - 3 then input.substr(0, nb - 3) + "..." else input
