angular.module("services")
	.factory("Events", ['$http', '$window', 'config', function($http, $window, config) {
		var eventFactory = {};

		// create a user
		eventFactory.create = function(eventData) {
			return $http.post(config.api_url + "/event/", eventData);
		};

		return eventFactory;
	}]);
