var errors = require("../helpers/errors");
var Events = require("../models/event");
var Users = require("../models/user");
var mailer = require("../helpers/mailer");
var _ = require('lodash');

function createEvent(req, res) {
  var event = new Events();

  event.title = req.body.title;
  event.description = req.body.description;
  event.dateEvent = req.body.dateEvent;
  event.guestList = req.body.guestList;
  event.ownerId = req['current_user']._id;

  event.save(function(err) {
    if(err) {
      return res.status(400).json(errors.newError(errors.errorsEnum.CantCreateEvent, err));
    } else {
      var usersId = [];
      event.guestList.forEach(function(guest) {
        usersId.push(guest.userId);
      });

      Users
        .find({'_id': {$in: usersId}})
        .select('email')
        .exec(function(err, users) {
          users.forEach(function(user) {
            mailer.sendEventInvitation(user, function(error){
              // TODO: Handle error if exists
            });
          });
        });

      res.status(201).json({
        message: "Event created!",
        event: event.asJson()
      });
    }
  });
}

exports.createEvent = createEvent;
