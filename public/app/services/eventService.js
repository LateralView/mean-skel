angular.module("services")
	.factory("Events", ['$http', '$window', 'config', function($http, $window, config) {
		var eventFactory = {};

		// create a user
		eventFactory.create = function(eventData) {
			return $http.post(config.api_url + "/event/", eventData);
		};

		// update a user
		eventFactory.update = function(eventData) {
			return $http.put(config.api_url + "/event/", eventData);
		};

		// get events
		eventFactory.getDiary = function() {
			return $http.get(config.api_url + "/event/");
		};

		// get pendings
		eventFactory.getPendings = function() {
			return $http.get(config.api_url + "/event/pending");
		};

		// my events
		eventFactory.myEvents = function() {
			return $http.get(config.api_url + "/event/my/events");
		};

		// answer event
		eventFactory.answer = function(eventData) {
			return $http.put(config.api_url + "/event/answer", eventData);
		};

		// cancel event
		eventFactory.cancelEvent = function(eventData) {
			return $http.put(config.api_url + "/event/cancel", eventData);
		};

		return eventFactory;
	}]);
