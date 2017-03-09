angular.module("controllers")
  .controller("eventCreateController", ['Events', 'User', 'Auth', '$location', 'flash', function(Events, User, Auth, $location, flash) {
    var vm = this;

    vm.config = { startView:'day' };
    vm.showCalendar = false;

    vm.calendar = function() {
      vm.showCalendar = !vm.showCalendar;
    }

    vm.pickValue = function(newDate, oldDate) {
      vm.showCalendar = false;
      vm.selectedDateTransform = moment(vm.selectedDate).format("LLLL");
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

    vm.showText = function(ev) {
      ev.isCollapsed = !ev.isCollapsed;
    }

    Events.getDiary().then(function(response) {
        vm.myDiary = response.data.eventData.map((eventData) => {
          eventData.isCollapsed = false;
          return eventData;
        });
    }, function(response) {
      flash.setErrors(response.data);
    });
  }])

  .controller("eventPendingController", ['Events', 'Auth', '$location', 'flash', function(Events, Auth, $location, flash) {
    var vm = this;

    vm.showText = function(ev) {
      ev.isCollapsed = !ev.isCollapsed;
    }

    Events.getPendings().then(function(response) {
        vm.pendings = response.data.eventData.map((eventData) => {
          eventData.isCollapsed = false;
          return eventData;
        });
    }, function(response) {
      flash.setErrors(response.data);
    });

    vm.accept = function(ev) {
      ev.isCollapsed = ev.isCollapsed ? true : true;
      Events.answer({'eventId': ev._id, 'answer': 'accept'}).then(function(response) {
        var index = vm.pendings.indexOf(ev);
        vm.pendings.splice(index, 1);
      }, function(response) {
        flash.setErrors(response.data);
      });
    }

    vm.reject = function(ev) {
      ev.isCollapsed = ev.isCollapsed ? true : true;
      Events.answer({'eventId': ev._id, 'answer': 'reject'}).then(function(response) {
        var index = vm.pendings.indexOf(ev);
        vm.pendings.splice(index, 1);
      }, function(response) {
        flash.setErrors(response.data);
      });
    }

  }])
  .controller("eventMyEventsController", ['Events', 'Auth', '$location', 'flash', function(Events, Auth, $location, flash) {
    var vm = this;

    Events.myEvents().then(function(response) {
        vm.myEvents = response.data.eventData.map((eventData) => {
          eventData.isCollapsed = false;
          return eventData;
        });
    }, function(response) {
      flash.setErrors(response.data);
    });

    vm.showText = function(ev) {
      ev.isCollapsed = !ev.isCollapsed;
    }

    vm.cancelEvent = function(ev) {
      Events.cancelEvent({'eventId': ev._id}).then(function(response) {
        var index = vm.myEvents.indexOf(ev);
        vm.myEvents.splice(index, 1);
      }, function(response) {
        flash.setErrors(response.data);
      });
    }

    vm.editEvent = function(ev) {
      $location.path("/event/edit/"+ev._id).search(ev);
    }

  }])
  .controller("eventEditController", ['Events', 'User', 'Auth', '$location', 'flash', '$routeParams', function(Events, User, Auth, $location, flash, $routeParams) {
    var vm = this;
    vm.eventData = $routeParams;

    User.getUsers().then(function(response) {
      var usersId = vm.eventData.guestList.map(function(guest) {
        return guest[0]._id;
      });

      vm.itemArray = response.data.user.map(function(item) {
        item.selected = usersId.indexOf(item._id) < 0 ? false : true;
        return item;
      });

      vm.usersSelected = vm.itemArray.filter(function(item) {
        return item.selected;
      });

    }, function(response) {
      flash.setMessage(response.data.errors.user.message, "danger");
    });


    vm.updateEvent = function() {

      var usersId = vm.usersSelected.map(function(user) {
        return {'userId': user._id};
      });

      var eventData = {
        "eventId": vm.eventData._id,
        "title": vm.eventData.title,
        "description": vm.eventData.description,
        "guestList": usersId
      };

      Events.update(eventData).then(function(response) {
        flash.setMessage('Event updated!');
      	$location.path("/my/events");
      }, function(response) {
        flash.setErrors('Error on update');
      });
    }

  }])
