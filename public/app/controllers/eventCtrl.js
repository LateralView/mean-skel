angular.module("controllers")
  .controller("eventCreateController", ['User', 'Auth', '$location', 'flash', function(User, Auth, $location, flash) {
    var vm = this;

    vm.test = 'Hola';
  }])
