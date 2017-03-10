angular.module("app.routes", ["ngRoute"])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider
      .when("/home", {
        templateUrl: "app/views/pages/home.html",
        authenticate: false
      })

      .when("/signup", {
        templateUrl: "app/views/users/new.html",
        controller: "userCreateController",
        controllerAs: "user",
        authenticate: false
      })

      .when("/login", {
        templateUrl: "app/views/pages/login.html",
        controller: "mainController",
        controllerAs: "login",
        authenticate: false
      })

      .when("/user", {
        templateUrl: "app/views/users/edit.html",
        controller: "userEditController",
        controllerAs: "user",
        authenticate: true
      })

      .when("/activate/:activation_token", {
        templateUrl: "app/views/users/activate.html",
        controller: "userActivationController",
        controllerAs: "user",
        authenticate: false
      })

      .when("/event/create", {
        templateUrl: "app/views/events/create.html",
        controller: "eventCreateController",
        controllerAs: "event",
        authenticate: true
      })

      .when("/diary", {
        templateUrl: "app/views/events/diary.html",
        controller: "eventDiaryController",
        controllerAs: "event",
        authenticate: true
      })

      .when("/pending", {
        templateUrl: "app/views/events/pending.html",
        controller: "eventPendingController",
        controllerAs: "event",
        authenticate: true
      })

      .when("/my/events", {
        templateUrl: "app/views/events/myEvents.html",
        controller: "eventMyEventsController",
        controllerAs: "event",
        authenticate: true
      })

      .when("/event/edit/:eventId", {
        templateUrl: "app/views/events/edit.html",
        controller: "eventEditController",
        controllerAs: "event",
        authenticate: true
      })

      .otherwise({
          redirectTo: '/home'
      });

    $locationProvider.html5Mode(true);
  }])
