var errors = require("../helpers/errors");
var _ = require('lodash');
var moment = require('moment');

function events(model, mailer, Users) {
  this.model = model;
  this.mailer = mailer;
  this.Users = Users;
  this.createEvent = function(req, res) {
    var eventData = new this.model();

    eventData = Object.assign(eventData, _.pick(req.body, ['title', 'description', 'dateEvent','guestList']));
    eventData.ownerId = req['current_user']._id;

    eventData.save(this.saveEvent.bind(this, res, eventData));
  }

  this.saveEvent = function(res, eventData, err) {
    if(err)
      return res.status(400).json(errors.newError(errors.errorsEnum.CantCreateEvent, err));

    var usersId = eventData.guestList.map(guest => guest.userId);

    this.Users
      .find({'_id': {$in: usersId}})
      .select('email')
      .exec(this.sendEventInvitation.bind(this));

    res.status(201).json({
      message: "Event created!",
      eventData: eventData.asJson()
    });
  }

  this.sendEventInvitation = function(err, users) {
    users.forEach(user => {
      this.mailer.sendEventInvitation(user, function(error) {
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

    var ownerId = String(eventData.ownerId);
    var currentUser = String(req['current_user']._id);

    if(currentUser != ownerId) {
      return res.status(400).send(errors.newError(errors.errorsEnum.IsntOwnerEvent, err));
    }

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

  this.answerEvent = function(req, res) {
    var eventId = req.body.eventId;
    var userId = req['current_user']._id;

    this.model
      .findOne({'_id': eventId})
      .select()
      .exec(this.updateStatusEvent.bind(this, eventId, userId, req, res));
  }

  this.updateStatusEvent = function(eventId, userId, req, res, err, eventData) {
    if(err)
      return res.status(400).send(errors.newError(errors.errorsEnum.CantFindEvent, err));

    var answer = req.body.answer;
    var index = _.findIndex(eventData.guestList, {'userId': userId});

    if(eventData.guestList[index].status.toLowerCase() != 'pending')
      return res.status(400).send(errors.newError(errors.errorsEnum.AlreadyAnsweredEvent, err));

    eventData.guestList[index].status = answer;

    this.model.update({'_id': eventId}, {$set: {guestList: eventData.guestList}}, this.responseEventUpdate.bind(this, req, res, eventData, answer));

  }

  this.responseEventUpdate = function(req, res, eventData, answer, err, updateEvent) {
    if (err) return res.status(400).send(errors.newError(errors.errorsEnum.CantUpdateEvent, err));

    Users
      .findOne({'_id': eventData.ownerId})
      .select()
      .exec(this.emailToOwnerEvent.bind(this, req, answer));

    res.json({
      message: "Event updated!",
      eventData: eventData
    });
  }

  this.emailToOwnerEvent = function(req, answer, err, user) {
    this.mailer.answerEventInvitation({answer, 'userEmail': req['current_user'].email, 'email': user.email}, function(error) {
    });
  }

  this.cancelEvent = function(req, res) {
    var eventId = req.body.eventId;

    this.model
      .findOne({'_id': eventId})
      .select("guestList title active")
      .exec(this.eventToCancel.bind(this, req, res, eventId));
  }

  this.eventToCancel = function(req, res, eventId, err, eventData) {
    if(err)
      return res.status(400).send(errors.newError(errors.errorsEnum.CantFindEvent, err));

    if(!eventData.active)
      return res.status(400).send(errors.newError(errors.errorsEnum.EventAlreadyCanceled, err));

    this.model.update({'_id': eventId}, {$set: {active: false}}, this.updateEventToCancel.bind(this, res, eventData));
  }

  this.updateEventToCancel = function(res, eventData, err, updateEvent) {
    if(err)
      return res.status(400).send(errors.newError(errors.errorsEnum.CantUpdateEvent, err));

    var usersId = [];
     eventData.guestList.forEach((guest) => {
      if(guest.status != 'reject')
        usersId.push(guest.userId);
    });

    this.Users
      .find({'_id': {$in: usersId}})
      .select('email')
      .exec(this.emailCancelEvent.bind(this, eventData));

    res.json({
      message: "Event cancel! :(",
      eventData: eventData
    })
  }

  this.emailCancelEvent = function(eventData, err, users) {
    users.forEach((user) => {
      this.mailer.cancelEvent(eventData, user, function(error){
        // TODO: Handle error if exists
      });
    });
  }

  this.getEvents = function(req, res) {
    var today = new Date();

    this.model.aggregate(
      [
        {
          "$lookup": {
            "from": 'users',
            "localField": "ownerId",
            "foreignField": "_id",
            "as": "owner"
          }
        },
        {
          $match: {
            'active': true,
            'dateEvent': {$gte: today},
            $or: [
              {'ownerId': req['current_user']._id },
              { guestList: { $elemMatch: {'userId': req['current_user']._id, 'status': 'accept'} } }
            ],
          }
        }
      ], this.responseGetEvents.bind(this, res)
    );
  }

  this.getEventsPending = function(req, res) {
    var today = new Date();

    this.model.aggregate(
      [
        {
          "$lookup": {
            "from": 'users',
            "localField": "ownerId",
            "foreignField": "_id",
            "as": "owner"
          }
        },
        {
          $match: {
            'active': true,
            'dateEvent': {$gte: today},
            $or: [
              { guestList: { $elemMatch: {'userId': req['current_user']._id, 'status': 'pending'} } }
            ],
          }
        }
      ], this.responseGetEvents.bind(this, res));
  }

  this.getMyEvents = function(req, res) {
    var today = new Date();
    this.model.aggregate([
      { '$unwind': "$guestList"},
      {
        $match: {
          'active': true,
          'dateEvent': {$gte: today},
          'ownerId': req['current_user']._id
        }
      },
      {
        '$lookup': {
          'from': 'users',
          'localField': 'guestList.userId',
          'foreignField': '_id',
          'as': 'invitados'
        }
      },
      {
        $group: {
          '_id': '$_id',
          'title': {$first: '$title'},
          'description': {$first: '$description'},
          'dateEvent': {$first: '$dateEvent'},
          'guestList': { $push: '$invitados' }
        }
      },
    ], this.responseGetEvents.bind(this, res));
  }

  this.responseGetEvents = function(res, err, result) {
    res.json({
      eventData: result
    });
  }

}




module.exports = events;
