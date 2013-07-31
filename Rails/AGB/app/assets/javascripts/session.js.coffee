# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

app = angular.module "agb", []

# Configuration
app.config ['$routeProvider', ($routeProvider) ->
	$routeProvider.when "/sign_in", {templateUrl: 'client_views/sign_in', controller: 'SessionController'}
	$routeProvider.when "/sign_up", {templateUrl: 'client_views/sign_up', controller: 'SessionController'}
	$routeProvider.otherwise {templateUrl: 'client_views/not_found'}
]

app.config ['$httpProvider', ($httpProvider) ->
	$httpProvider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
]


# Directive


# Controllers
app.controller 'SessionController', ['$scope', '$location', '$http', ($scope, $location, $http, $window) ->
	$location.path "/sign_in" if $location.$$path == ""
	

	$scope.signIn = () ->
		request = name: $('#username').val(), password: $('#password').val()
		$http.post("/session", request).success((data) ->
				if data['status'] == 'success'
					window.location.href = "/"
				else
					$location.path "/sign_in"
		).error((data) ->
			console.log 'Failure', data
		)

	$scope.signUp = () ->
		request = user: 
						{
						name: $('#username').val(),
						email: $('#email').val(),
						password: $('#password').val()
						}
		$http.post("/users", request).success((data) ->
			$http.post("/session", { name: $('#username').val(), password: $('#password').val()}).success((data) ->
				if data['status'] == 'success'
					window.location.href = "/"
				else
					$location.path "/sign_in"
			).error(() ->
				console.log 'Failure', data
				$location.path "/sign_in"
			)
		).error((data) ->
			console.log 'Failure', data
		)
]
