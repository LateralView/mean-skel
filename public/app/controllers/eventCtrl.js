angular.module("controllers")
  .controller("eventCreateController", ['Events', 'User', 'Auth', '$location', 'flash', function(Events, User, Auth, $location, flash) {
    var vm = this;

    vm.config = { startView:'day', minView:'day' };
    vm.showCalendar = false;

    vm.calendar = function() {
      vm.showCalendar = !vm.showCalendar;
    }

    vm.pickValue = function(newDate, oldDate) {
      vm.showCalendar = false;
      vm.selectedDateTransform = moment(vm.selectedDate).format("MM-DD-YYYY");
    }

    User.getUsers().then(function(response) {
      vm.itemArray = response.data.user;
    }, function(response) {
      flash.setMessage(response.data.errors.user.message, "danger");
    });

    vm.saveEvent = function() {
      var usersId = [];
      vm.processing = true;

      vm.usersSelected.forEach(function(user) {
        usersId.push({'userId': user._id});
      });

      var eventData = {
        "title": vm.title,
        "description": vm.description,
        "dateEvent": vm.selectedDate,
        "guestList": usersId
      };

      Events.create(eventData).then(function(response) {
        vm.processing = false;
        flash.setMessage('Event created!');
      	$location.path("/home");
      }, function(response) {
        vm.processing = false;
        flash.setErrors(response.data);
      });
    }
  }])

    .controller("eventDiaryController", ['Events', 'Auth', '$location', 'flash', function(Events, Auth, $location, flash) {
      var vm = this;

      vm.test = 'hola';
  }])
