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

function updateEvent(req, res) {
  var eventId = req.body.eventId;


  Events
    .findOne({'_id': eventId})
    .select()
    .exec(function(err, event) {
      if(err)
        return res.status(400).send(errors.newError(errors.errorsEnum.CantFindEvent, err));

      if(req['current_user']._id != event.ownerId)
        return res.status(400).send(errors.newError(errors.errorsEnum.IsntOwnerEvent, err));

      if(req.body.title)
        event.title = req.body.title;

      if(req.body.description)
        event.description = req.body.description;

      if(req.body.guestList)
        event.guestList = req.body.guestList;

      Events.update({'_id': eventId}, {$set: event}, function(err, updateEvent) {
        if (err) return res.status(400).send(errors.newError(errors.errorsEnum.CantUpdateEvent, err));

        res.json({
          message: "Event updated!",
          event: event
        });
      });
    });
}

function answerEvent(req, res) {
  var eventId = req.body.eventId;
  var userId = req['current_user']._id;

  Events
    .findOne({'_id': eventId})
    .select()
    .exec(function(err, event) {
      if(err)
        return res.status(400).send(errors.newError(errors.errorsEnum.CantFindEvent, err));

      var answer = req.body.answer;
      var index = _.findIndex(event.guestList, {'userId': userId});

      if(event.guestList[index].status.toLowerCase() != 'pending')
        return res.status(400).send(errors.newError(errors.errorsEnum.AlreadyAnsweredEvent, err));

      event.guestList[index].status = answer;

      Events.update({'_id': eventId}, {$set: {guestList: event.guestList}}, function(err, updateEvent) {
        if (err) return res.status(400).send(errors.newError(errors.errorsEnum.CantUpdateEvent, err));

        Users
          .findOne({'_id': event.ownerId})
          .select()
          .exec(function(err, user) {
            mailer.answerEventInvitation({answer, 'userEmail': req['current_user'].email, 'email': user.email}, function(error) {
            });
          })

        res.json({
          message: "Event updated!",
          event: event
        });
      });

    });
}

function cancelEvent(req, res) {
  var eventId = req.body.eventId;

  Events
  .findOne({'_id': eventId})
  .select("guestList title active")
  .exec(function(err, event) {
    if(!event.active)
      return res.status(400).send(errors.newError(errors.errorsEnum.EventAlreadyCanceled, err));

    Events.update({'_id': eventId}, {$set: {active: false}}, function(err, updateEvent) {

          var usersId = [];
          event.guestList.forEach(function(guest) {
            usersId.push(guest.userId);
          });

          Users
            .find({'_id': {$in: usersId}})
            .select('email')
            .exec(function(err, users) {
              users.forEach(function(user) {
                mailer.cancelEvent(event, user, function(error){
                  // TODO: Handle error if exists
                });
              });
            });

          res.json({
            message: "Event canceled! :(",
            event: event
        })
      });
  });
}

exports.createEvent = createEvent;
exports.updateEvent = updateEvent;
exports.answerEvent = answerEvent;
exports.cancelEvent = cancelEvent;
