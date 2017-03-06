var errors = require("../helpers/errors");
var Events = require("../models/event");
var Users = require("../models/user");
var mailer = require("../helpers/mailer");
var _ = require('lodash');

function events(model) {
  this.model = model;
  this.mailer = mailer;
  this.createEvent = function(req, res) {
    console.log('-------------------------------------');
    console.log(model);
    console.log('-------------------------------------');
    var eventData = new this.model.model();
    eventData.model = _.pick(req.body, ['title', 'description', 'dateEvent','guestList']);
    eventData.model.ownerId = req['current_user']._id;

    console.log('eventData: ', eventData);
    eventData.model.save(this.saveEvent.bind(res, eventData.guestList));
  }

  this.saveEvent = function(res, guestList, err) {
    console.log(arguments);
    if(err)
      return res.status(400).json(errors.newError(errors.errorsEnum.CantCreateEvent, err));

    var usersId = guestList.map(guest => guest.userId);

    Users
      .find({'_id': {$in: usersId}})
      .select('email')
      .exec(sendEventInvitation);

    res.status(201).json({
      message: "Event created!",
      eventData: eventData.asJson()
    });
  }

  this.sendEventInvitation = function(err, users) {
    users.forEach(function(user) {
      this.mailer.sendEventInvitation(user, function(error){
        // TODO: Handle error if exists
      });
    });
  }

  this.updateEvent = function(req, res) {
    var eventId = req.body.eventId;

    this.model
      .findOne({'_id': eventId})
      .select()
      .exec(this.findUpdateEvent.bind(this, req, res, eventId));
  }

  this.findUpdateEvent = function(req, res, eventId, err, eventData) {
    if(err)
      return res.status(400).send(errors.newError(errors.errorsEnum.CantFindEvent, err));

    if(req['current_user']._id != eventData.ownerId)
      return res.status(400).send(errors.newError(errors.errorsEnum.IsntOwnerEvent, err));

    eventData = _.pick(req.body, ['title', 'description', 'guestList']);

    this.model.update({'_id': eventId}, {$set: eventData}, this.callbackUpdateEvent.bind(this, res));
  }

  this.callbackUpdateEvent = function(res, err, eventData) {
    if (err) return res.status(400).send(errors.newError(errors.errorsEnum.CantUpdateEvent, err));

    res.json({
      message: "Event updated!",
      eventData: eventData
    });
  }

}


module.exports = events;

// function answerEvent(req, res) {
//   var eventId = req.body.eventId;
//   var userId = req['current_user']._id;
//
//   Events
//     .findOne({'_id': eventId})
//     .select()
//     .exec(function(err, event) {
//       if(err)
//         return res.status(400).send(errors.newError(errors.errorsEnum.CantFindEvent, err));
//
//       var answer = req.body.answer;
//       var index = _.findIndex(event.guestList, {'userId': userId});
//
//       if(event.guestList[index].status.toLowerCase() != 'pending')
//         return res.status(400).send(errors.newError(errors.errorsEnum.AlreadyAnsweredEvent, err));
//
//       event.guestList[index].status = answer;
//
//       Events.update({'_id': eventId}, {$set: {guestList: event.guestList}}, function(err, updateEvent) {
//         if (err) return res.status(400).send(errors.newError(errors.errorsEnum.CantUpdateEvent, err));
//
//         Users
//           .findOne({'_id': event.ownerId})
//           .select()
//           .exec(function(err, user) {
//             mailer.answerEventInvitation({answer, 'userEmail': req['current_user'].email, 'email': user.email}, function(error) {
//             });
//           })
//
//         res.json({
//           message: "Event updated!",
//           event: event
//         });
//       });
//
//     });
// }
//
// function cancelEvent(req, res) {
//   var eventId = req.body.eventId;
//
//   Events
//   .findOne({'_id': eventId})
//   .select("guestList title active")
//   .exec(function(err, event) {
//     if(!event.active)
//       return res.status(400).send(errors.newError(errors.errorsEnum.EventAlreadyCanceled, err));
//
//     Events.update({'_id': eventId}, {$set: {active: false}}, function(err, updateEvent) {
//
//           var usersId = [];
//           event.guestList.forEach(function(guest) {
//             usersId.push(guest.userId);
//           });
//
//           Users
//             .find({'_id': {$in: usersId}})
//             .select('email')
//             .exec(function(err, users) {
//               users.forEach(function(user) {
//                 mailer.cancelEvent(event, user, function(error){
//                   // TODO: Handle error if exists
//                 });
//               });
//             });
//
//           res.json({
//             message: "Event canceled! :(",
//             event: event
//         })
//       });
//   });
// }
//
// exports.createEvent = createEvent;
// exports.updateEvent = updateEvent;
// exports.answerEvent = answerEvent;
// exports.cancelEvent = cancelEvent;
//
//
//
//
