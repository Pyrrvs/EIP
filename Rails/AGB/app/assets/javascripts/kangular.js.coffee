$ ->
	$('*[ng-app]').hide().css('visibility', 'visible').fadeIn(300)

@kangular = (name) ->

	app = angular.module name, []

	app.service 'array', ['$parse', ($parse) ->
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

			# scope.$watch (->
			# 	return changeDetected unless newValue = objGetter(scope)
			# 	++changeDetected if newValue.length != oldValue.length
			# 	changeDetected
			# 	# _(newValue).fold changeDetected, (mem, v, k) ->
			# 	# 	if angular.equals(v, oldValue[k]) then changeDetected else ++changeDetected
			# ), ->
			# 	_.chain(newValue).difference(oldValue).each added_listener
			# 	_.chain(oldValue).difference(newValue).each removed_listener
			# 	oldValue = _.extend [], newValue

	app.config ['$httpProvider', ($httpProvider) ->
		$httpProvider.responseInterceptors.push('myHttpInterceptor')
		$httpProvider.defaults.transformRequest.push (data) ->
			++app.scope.loading; data
	]

	app.factory 'myHttpInterceptor', [ '$q', ($q) ->
		(promise) ->
			promise.then(((response) -> --app.scope.loading; response),
				((response) -> --app.scope.loading; $q.reject(response)))
	]

	app.bind = (scope, prop, to_bind, deep = true) ->
		if _(to_bind).array()
			scope.$watch prop, ((v) -> app.extend(e, v) for e in to_bind), deep
		else
			scope.$watch prop, ((v) -> app.extend(to_bind, v)), deep

	app.extend = (obj1, obj2) ->
		return obj1 if !obj2
		obj3 = {}
		for i, v of obj2
			if i.charAt(0) != '$' && i.substr(0, 2) != '$$'
				obj3[i] = v
		return _.deep_extend obj1, obj3

	# messages over controllers
	app.service 'messages', ->
		pop: (from, scope) ->
			messages = []
			@listeners[from] = scope
			(messages.push message; scope.$eval message.content if message.to == from) for message in @messages
			@messages = _(@messages).remove messages
		push: (to, content) -> @messages.push {to: to, content: content}
		instant: (to, content) -> @listeners[to].$eval content if @listeners[to]
		messages: []
		listeners: {}

	app.redirect_to = (url) ->
		$("body").fadeOut 100, -> window.location.href = url

	app.$$apply = (scope, action) -> if !scope.$$phase then scope.$apply action else scope.$eval action

	app.model = (name, defaults) ->
		app.models = _(app.models).let {}
		app.models[name] = (properties) ->
			_.chain(defaults()).fold({}, (mem, v, k) -> mem[k] = (if _(v).func() then v() else v); mem).extend(properties).value()

	app.config ["$httpProvider", ($httpProvider) ->
	  $httpProvider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content')
	]

	app.factory 'app_scope', [ "$rootScope", ($rootScope) ->
		$rootScope.$$childHead
	]

	app.animation 'view-enter', ->
		start: (element, done) -> element.parent().parent().css("visibility", "inherit")

	app.animation 'fade-in', ->
		start: (element, done) -> element.stop().hide().fadeIn(150, done)

	app.animation 'fade-out', ->
		start: (element, done) -> element.stop().fadeOut(300, done)

	app.animation 'fade-out-quick', ->
		start: (element, done) -> element.stop().fadeOut(150)

	app.animation 'slow', ->
		start: (element, done) -> element.stop().hide().show("slow", done)

	app.animation 'height-hide', ->
		start: (element, done) ->
			height = element.height()
			element.stop().animate({ height: 0 }, -> element.height(height); done())

	app.animation 'height-show', ->
		start: (element, done) ->
			element.stop().height(0).animate({ height: height }) if height = element.height()

	app.directive 'ngxFirst', ->
		(scope, element, attrs) ->
			scope.$watch '$first', -> element.toggleClass attrs.ngxFirst || 'first', scope.$first

	app.directive 'ngxLast', ->
		(scope, element, attrs) ->
			scope.$watch '$last', -> element.toggleClass attrs.ngxLast || 'last', scope.$last

	app.directive 'ngxMiddle', ->
		(scope, element, attrs) ->
			scope.$watch '$middle', -> element.toggleClass attrs.ngxMiddle || 'middle', scope.$middle

	app.directive 'ngxPosition', ->
		(scope, element, attrs) ->
			scope.$watch '$index', ->
				element.toggleClass("first", scope.$first).toggleClass("middle", scope.$middle).toggleClass("last", scope.$last)

	app.directive 'ngxKeydown', ->
		(scope, element, attrs) ->
			$("body").keydown (e) -> scope.$apply -> scope.$event = e; scope.$eval attrs.ngxKeydown

	app.directive 'ngxShortcut', ->
		(scope, element, attrs) ->
			[key, shift] = if match = /.*shift\+(.+)/g.exec attrs.ngxShortcut then [+match[1], true] else [+attrs.ngxShortcut, false]
			$("body").keydown (e) ->
				element.click() if e.keyCode == key && e.shiftKey == shift

	app.directive 'ngxCollapse', ->
		(scope, element, attrs) ->
			element.addClass "collapse"
			scope.$watch attrs.ngxCollapse, (v) ->
				if v then (element.collapse('show') if !element.is('.in'))
				else if element.is(".in") then element.collapse('hide')

	app.directive 'ngxDropdown', ->
		(scope, element, attrs) ->
			element.click -> element.parent().toggleClass "open"
			$(document).click (e) -> element.parent().removeClass "open" if !$(e.target).closest(element.parent()).length

	app.directive 'ngxToggle', ->
		(scope, element, attrs) ->
			$el = if attrs.ngxToggle then _(element).$find(attrs.ngxToggle) else element
			$el.addClass "collapse"
			element.click -> $el.collapse "toggle"

	app.directive 'ngxAccordionToggle', ->
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

	app.directive 'ngxEllipsis', ->
		(scope, element, attrs) ->
			element.css
				'white-space': 'nowrap'
				'max-width': if attrs.ngxEllipsis then +attrs.ngxEllipsis else '150px'
				'text-overflow': 'ellipsis'
				'overflow': 'hidden'

	app.directive 'ngxTrigger', ->
		(scope, element, attrs) ->
			event = attrs.ngxTrigger.split(" ")
			event_type = event.shift()
			event_target = event.join(" ")
			element.on event_type, (e) -> $(event_target).trigger(event_type, e)

	app.directive 'ngxEvent', ->
		(scope, element, attrs) ->
			event = attrs.ngxEvent.split(" ")
			event_type = event.shift()
			event_action = event.join(" ")
			element.on event_type, (e) -> scope.$apply -> scope.$event = e; scope.$eval event_action

	app.directive 'ngxEvents', ->
		(scope, element, attrs) ->
			events = attrs.ngxEvents.split(" ")
			for event in events
				element.on(event, do (event, element) -> (e, a) ->
					scope.$apply -> scope.$event = e; scope.$attr = a; e.stopPropagation(); scope.$eval attrs["ngxOn#{_(event).capitalize()}"])

	app.directive 'ngxClassOnover', ->
		(scope, element, attrs) ->
			element.on("mouseenter", -> element.addClass attrs.ngxClassOnover).on("mouseleave", -> element.removeClass attrs.ngxClassOnover)

	app.directive 'ngxVisible', ->
		(scope, element, attrs) ->
			scope.$watch attrs.ngxVisible, (v) ->
				element.css visibility: if v then "visible" else "hidden"

	app.directive 'ngxClickOut', ->
		(scope, element, attrs) ->
			$(document).click (e) ->
				if !$(e.target).closest(element).length && !$(e.target).closest(attrs.ngxClickOutExcept).length
					scope.$apply attrs.ngxClickOut

	app.directive 'ngxFocus', ->
		(scope, element, attrs) ->
			scope.$watch attrs.ngxFocus, (v) -> _(-> element.focus()).defer() if v

	app.directive 'ngxBlur', ->
		(scope, element, attrs) ->
			scope.$watch attrs.ngxBlur, (v) -> _(-> element.blur()).defer() if v

	app.directive 'ngxSelectable', ->
		(scope, element, attrs) ->
			scope.$watch attrs.ngxSelectable, (v) ->
				if v then element.enableSelection() else element.disableSelection()

	app.directive 'ngxDraggable', ->
		(scope, element, attrs) ->
			options =
				revert: "invalid"
				revertDuration: 200
				start: () -> element.css('z-index', '+=1'); angular.__draggable = scope.$eval attrs.ngxDraggable
				stop: () -> element.css('z-index', '-=1')
			element.draggable(options).disableSelection()

	app.directive 'ngxDroppable', ->
		(scope, element, attrs) ->
			options =
				drop: -> scope.$apply -> scope.draggable = angular.__draggable; scope.$eval attrs.ngxDroppable
				activeClass: "droppable"
			if attrs.ngxDroppableAccept
				options.accept = -> scope.$apply -> scope.draggable = angular.__draggable; scope.$eval attrs.ngxDroppableAccept
			element.droppable(options).disableSelection()

	app.directive 'ngxSortable', ->
		(scope, element, attrs) ->
			element.disableSelection().sortable
        containment: element.parent()
        forcePlaceholderSize: true
        tolerance: 'pointer'
        revert: true
      scope.$watch attrs.ngxSortable, (sortable) ->
	      element.sortable if sortable then 'enable' else 'disable'

	app.directive 'ngxFit', ->
		(scope, element, attrs) ->
			resize = -> 
				element.width(0).width(_(element.parent().find("> *")).fold 0, (res, e) ->
					res - _($(e)).totalWidth() - element.parent().width() -
					_(element.parent().css("paddingLeft")).pxToInt() -
					_(element.parent().css("paddingRight")).pxToInt())
			$(window).resize(resize)
			if attrs.ngxFit then scope.$watch attrs.ngxFit, resize else resize()

	app.directive 'ngxModal', ->
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

	app.directive 'ngxModalFocus', ->
		(scope, element, attrs) ->
			element.closest(".modal").on "shown", -> element.focus()

	app.directive 'ngxModalHeader', [ "$compile", ($compile) ->
		(scope, element, attrs) ->
			element.addClass 'modal-header'
			element.append "<button type='button' class='close' ngx-close-modal ngx-tooltip=\"'close'\" ngx-placement='left'
			ngx-move='0 3' aria-hidden='true'>&times;</button><span class='lead'>{{ #{attrs.ngxModalHeader} }}</span>"
			$compile(element.children()) scope
	]

	app.directive 'ngxCloseModal', ->
		(scope, element, attrs) ->
			element[if element.is 'form' then 'submit' else 'click'] ->
				(if attrs.ngxCloseModal then $(attrs.ngxCloseModal) else element.closest(".modal")).modal("hide")

	app.directive 'ngxOpenModal', ->
		(scope, element, attrs) ->
			element.click ->
				(if attrs.ngxOpenModal then $(attrs.ngxOpenModal) else element.closest(".modal")).modal("show")

	app.directive 'ngxLinkTo', [ "$location", ($location) ->
		(scope, element, attrs) ->
			link = if element.is("a") then element else element.find("> a").first()
			link.attr "href", "#/#{attrs.ngxLinkTo}"
			scope.$watch (-> $location.path()), ->
				element.toggleClass "active", link.attr("href") == "#" + $location.path() 
	]

	app.directive 'ngxPlacehold', ->
		(scope, element, attrs) ->
			[width, height] = attrs.ngxPlacehold?.split(" ")
			element.wrap $(document.createElement "div").width(width).height(height)
			.addClass("placeholder").css({ 'display': 'inline-block', 'vertical-align': 'middle' })
			element.bind 'load', ->
				element.unwrap()

	app.directive 'ngxRadio', ->
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

	app.directive 'ngxCheckbox', ->
		require: 'ngModel'
		link: (scope, element, attrs, ngModelCtrl) ->
			element.wrap('<div class="checkbox-wrapper"></div>').after('<span class="lbl"></span>')
			checked = false
			ngModelCtrl.$render = ->
				element[0].checked = ngModelCtrl.$viewValue
			element.click ->
				checked = element[0].checked
				_(-> scope.$apply -> ngModelCtrl.$setViewValue element[0].checked = checked).defer()

	app.directive 'ngxSelect', ->
		(scope, element, attrs) ->
			element.wrap("<div class='select'></div>")

	app.directive 'ngxEditable', [ "$compile", ($compile) ->
		(scope, element, attrs) ->
			id = attrs.id
			scope.view = _(scope.view).let {}
			element.find("button").attr 'ng-click', "view.editing_#{id} = true; view.input_#{id} = user.#{id}"
			element.wrapInner "<div ng-show='!view.editing_#{id}'></div>"
			element.append "<form ng-show='view.editing_#{id}' ng-submit='#{attrs.ngxEditable}; view.editing_#{id} = false' class='edit-form'>
			<input type='text' ngx-focus='view.editing_#{id}' ng-model='view.input_#{id}'/><button ng-click='view.editing_#{id} = false'
			type='button' class='close' aria-hidden='true'>&times;</button></form>"
			$("body").keydown (e) -> scope.$apply "view.editing_#{id} = false" if e.keyCode == 27
			$compile(element.children()) scope
	]

	app.$tooltip = null
	app.directive 'ngxTooltip', ->
		(scope, element, attrs) ->
			[l, t] = if attrs.ngxMove then attrs.ngxMove.split(" ") else [0, 0]
			[t, l] = [+t, +l]
			hover = false
			element.hover (->
				hover = true
				$('body').append app.$tooltip = $("<div style='position:absolute;z-index:9999;' class='tip'></div>").hide() if !app.$tooltip
				app.$tooltip.stop().show().text(scope.$eval attrs.ngxTooltip)
				tw = app.$tooltip[0].offsetWidth; th = app.$tooltip[0].offsetHeight;
				p = element.offset(); ew = element[0].offsetWidth; eh = element[0].offsetHeight
				pos = switch (placement = attrs.ngxPlacement || 'top')
					when 'bottom' then top: p.top + eh + 12 + t, left: p.left + ew / 2 - tw / 2 + l
					when 'top' then top: p.top - th - 12 + t, left:  p.left + ew / 2 - tw / 2 + l
					when 'left' then top: p.top + eh / 2 - th / 2 + t, left: p.left - tw - 12 + l
					when 'right' then top: p.top + eh / 2 - th / 2 + t, left: p.left + ew + 12 + l
				app.$tooltip.offset(pos).addClass(placement).hide().fadeIn(100)), ->
					hover = false; app.$tooltip.stop().show().fadeOut(100)
			element.on 'remove', -> app.$tooltip.stop().show().fadeOut(100) if hover

	app.directive 'ngxPopover', ->
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

	app.directive 'ngxAdmin', ->
		(scope, element, attrs) ->
			if attrs.ngxAdmin
				func = -> element.toggle !!(scope.admin && scope.$eval attrs.ngxAdmin)
				scope.$watch 'admin', func
				scope.$watch attrs.ngxAdmin, func
			else
				scope.$watch 'admin', -> element.toggle scope.admin

	app.directive 'ngxHover', ->
		(scope, element, attrs) ->
			hover = (bool) -> app.$$apply scope, "#{attrs.ngxHover} = #{bool}"
			element.hover((-> hover true), -> hover false).on 'remove', -> hover false

	app.directive 'ngxPopFromBottom', ->
		(scope, element, attrs) ->
			bottom = element.css('bottom')
			height = element.height()
			element.css {bottom: -height - 10, opacity: 0}
			scope.$watch attrs.ngxPopFromBottom, (v) ->
				if v then element.stop().animate({bottom:bottom, opacity: 1}, 500)
				else element.stop().animate({bottom: -height - 10, opacity: 0}, 500)

	app.directive 'ngxFade', ->
		(scope, element, attrs) ->
			speed = if attrs.ngxFadeSpeed then +attrs.ngxFadeSpeed else 300
			scope.$watch attrs.ngxFade, (v) ->
				if v then element.stop().fadeIn(speed) else element.stop().fadeOut(speed)

	app.directive 'ngxScrollTop', ->
		(scope, element, attrs) ->
			$win = $(window).scroll -> scope.$apply "#{attrs.ngxScrollTop} = #{$win.scrollTop() > 20}"

	app.directive 'ngxScrollDown', ->
		(scope, element, attrs) ->
			timer = null
			$win = $(window).scroll ->
				if !timer and $win.height() + $win.scrollTop() > $('html').height() - 100
					timer = scope.$apply attrs.ngxScrollDown
					setTimeout (-> clearTimeout timer; timer = null), 1500
			scope.$on '$destroy', -> $win.off 'scroll'; clearTimeout timer; timer = null

	app.directive 'ngxScrollToTop', ->
		(scope, element, attrs) ->
			element.click -> $("html, body").animate scrollTop: 0

	app.directive 'ngxScrollTo', ->
		(scope, element, attrs) ->
			($el = _(element).$parent ($el) -> $el.css("overflow-y") == "scroll")
			scope.$watch attrs.ngxScrollTo, (v) ->
				return scope.$eval "#{attrs.ngxScrollTo} = null" unless ($to = $(v)).length
				$el.scrollTop($to.addClass('scrolled-to').position().top - 100)

	app.directive 'ngxOrder', ->
		(scope, element, attrs) ->
			scope.$watch '$first', -> element.toggleClass "first", scope.$first
			scope.$watch '$middle', -> element.toggleClass "middle", scope.$middle
			scope.$watch '$last', -> element.toggleClass "last", scope.$last

	app.directive 'ngxParity', ->
		(scope, element, attrs) ->
			scope.$watch '$index', ->
				if scope.$index % 2 then element.addClass("odd").removeClass("even")
				else element.addClass("even").removeClass("odd")

	app.directive 'ngxDisabled', ->
		(scope, element, attrs) ->
			scope.$watch attrs.ngxDisabled, (v) ->
				element.attr("disabled", !!v).toggleClass("disabled", !!v)

	app.directive 'ngxAllDisabled', ->
		(scope, element, attrs) ->
			scope.$watch attrs.ngxAllDisabled, (v) ->
				element.find("*").attr("disabled", !!v).toggleClass("disabled", !!v)

	app.directive 'ngxTab', ->
		(scope, element, attrs) ->
			scope.$watch attrs.ngxTab, (v) -> element.find("[ngx-tab-pane]").each ->
				$e.tab("show") if ($e = $(@)).attr("ngx-tab-value") == v || $e.text() == v

	app.directive 'ngxTabPane', ->
		(scope, element, attrs) ->
			element.attr("data-target", attrs.ngxTabPane).attr("data-toggle", "tab").on "shown", ->
				tab = element.closest('[ngx-tab]').attr('ngx-tab')
				value = element.attr("ngx-tab-value") || element.text()
				app.$$apply scope, "#{tab} = '#{value}'"

	app.directive 'ngxTabOn', ->
		(scope, element, attrs) ->
			scope.$watch attrs.ngxTabOn, (v) ->
				return unless value = (if v then element.attr("ngx-tab-value") || element.text() else attrs.ngxTabOff)
				tab = element.closest("[ngx-tab]").attr("ngx-tab")
				scope.$eval "#{tab} = '#{value}'"

	app.filter 'stroke', ->
		(input, nb) ->
			return "" if !input
			if input.length > nb - 3 then input.substr(0, nb - 3) + "..." else input

	app