app = angular.module "agb", []

# Configuration 

app.config ['$routeProvider', ($routeProvider) ->
	$routeProvider.when "/profile", {templateUrl: 'client_views/profile'}
	$routeProvider.when "/projects/:project_id", {templateUrl: 'client_views/project', controller: 'ProjectController'}
	$routeProvider.when "/projects/:project_id/worldmaker", {templateUrl: 'client_views/worldmaker', controller: 'ProjectController'}
	$routeProvider.when "/stats", {templateUrl: 'client_views/to_be_released'}
	$routeProvider.when "/users", {templateUrl: 'client_views/to_be_released'}
	$routeProvider.when "/games", {templateUrl: 'client_views/to_be_released'}
	$routeProvider.when "/settings", {templateUrl: 'client_views/to_be_released'}
	$routeProvider.when "/messages", {templateUrl: 'client_views/to_be_released'}
	$routeProvider.otherwise {templateUrl: 'client_views/not_found', controller: "IndexController"}
]

app.config ['$httpProvider', ($httpProvider) ->
	$httpProvider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
]

# Directive

app.directive 'dataRemote', ->
	(scope, element, attrs) ->
		alert('test')
		element.submit (e) ->
			alert('test2')
			e.preventDefault()


# Controllers
app.controller 'IndexController', ['$scope', '$routeParams', '$location', '$http', ($scope, $routeParams, $location, $http, $window) ->	
	$location.path "/profile" if $location.$$path == ""
]

app.controller 'ProjectController', ['$scope', '$routeParams', '$location', '$http', ($scope, $routeParams, $location, $http, $window) ->
	$scope.project_id = $routeParams['project_id']
]