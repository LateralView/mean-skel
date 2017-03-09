var expect = require('chai').expect;
var sinon = require('sinon');
var EventHandler = require('../../app/handlers/eventsHandler');

describe('eventsHandler', function() {
  var eventHandler;
  var req = {};

  GLOBAL.res = {
    'status': function() {
      return {
        'send': function() { return 'error'; },
        'json': function() { return 'error'; },
      };
    },
    'json': function() { return 'success'; },
  };

  beforeEach(function() {
    eventHandler = new EventHandler({});

    eventHandler.model = function(){
      return {
        'save': sinon.spy()
      }
    };

    eventHandler.model.findOne = sinon.stub().returnsThis();
    eventHandler.model.select = sinon.stub().returnsThis();
    eventHandler.model.exec = sinon.spy();
    eventHandler.model.save = sinon.spy();
    eventHandler.model.update = sinon.spy();
    eventHandler.model.aggregate = sinon.spy();

    eventHandler.Users = {
      find: sinon.stub().returnsThis(),
      select: sinon.stub().returnsThis(),
      exec: sinon.spy(),
      save: sinon.spy(),
    }

    eventHandler.mailer = {
      sendEventInvitation: sinon.spy(),
      answerEventInvitation: sinon.spy(),
      cancelEvent: sinon.spy(),
    }

    req = {
      'current_user': {
        '_id': '999999999'
      },
      'body': {
        'eventId': '1111111111111111',
        'title': 'Title test',
        'description': 'Description teset',
        'dateEvent': '2017-03-18T14:55:00.000',
        'guestList': [{'userId': '111111'}],
        'answer': 'accept'

      }
    };

  });

  describe('Event', function() {
    describe('Function: createEvent', function(done) {
      context('createEvent', function() {
        it('Save called', function(done) {

          eventHandler.createEvent(req, res);
          expect(eventHandler.model.save).to.be.called;
          done();
        });
      });

      context('Function: saveEvent', function() {
        it('Should return message error', function(done) {
          const result = eventHandler.saveEvent(res, {}, true);

          expect(result).eql('error');
          done();
        });

        it('Should create event', function(done) {
          const guestList = [
            { 'userId': 1111 },
            { 'userId': 2222 }
          ];

          const asJson = function(){ return 'hola'; }

          eventHandler.saveEvent(res, {'guestList': guestList, 'asJson': asJson}, false);
          expect(eventHandler.Users.exec).to.be.called;
          done();
        });
      });

      context('sendEventInvitation', function() {
        it('Find one called', function(done) {
          const users = [
            { 'userId': 1111 },
            { 'userId': 2222 }
          ];

          eventHandler.sendEventInvitation(false, users);
          expect(eventHandler.mailer.sendEventInvitation).to.be.called;
          done();
        });
      });

    });

    describe('Function: updateEvent', function(done) {
      it('Find one called', function(done) {
        eventHandler.updateEvent(req);
        expect(eventHandler.model.exec).to.be.called;
        done();
      });

      context('When has error', function() {
        it('Should return message error', function(done) {
          const result = eventHandler.findUpdateEvent({}, res, '', true, {});
          expect(result).eql('error');
          done();
        });
      });

      context('When current_user is different to ownerId', function() {
        it('Should return message error', function(done) {
          const result = eventHandler.findUpdateEvent(req, res, '', false, {'ownerId': '111111111111111'});
          expect(result).eql('error');
          done();
        });
      });

      context('When current_user not exist', function() {
        it('Should return message error', function(done) {
          const result = eventHandler.findUpdateEvent({'current_user': {}}, res, '', false, {'ownerId': '111111111111111'});
          expect(result).eql('error');
          done();
        });
      });

      context('When ownerId not exist', function() {
        it('Should return message error', function(done) {
          const result = eventHandler.findUpdateEvent(req, res, '', false, {});
          expect(result).eql('error');
          done();
        });
      });

      context('Update event', function() {
        it('Update called', function(done) {
          const eventData = {
            'ownerId': '111111111111111',
            'title': 'Title test',
            'description': 'Title test',
            'guestList': [
              { 'userId': 111 }
            ]
          };

          eventHandler.findUpdateEvent(req, res, '', false, eventData);
          expect(eventHandler.model.update).to.be.called;
          done();
        });
      });
    });

    describe('Function: answerEvent', function(done) {

      context('answerEvent', function() {
        it('FindOne called', function(done) {
          eventHandler.answerEvent(req, res);
          expect(eventHandler.model.save).to.be.called;
          done();
        });
      });

      context('updateStatusEvent', function() {
        it('Should return message error', function(done) {
          const result = eventHandler.updateStatusEvent('1', '1', req, res, true, {});
          expect(result).eql('error');
          done();
        });

        context('guestList status undefined', function() {
          it('Should return message error', function(done) {
            const guestList = [
              { 'userId': 1111 },
              { 'userId': 2222 }
            ];

            const result = eventHandler.updateStatusEvent('1', '1', req, res, true, {'guestList': guestList});
            expect(result).eql('error');
            done();
          });
        });

        context('guestList status accept', function() {
          it('Should return message error', function(done) {
            const guestList = [
              { 'userId': 1111, 'status': 'accept' },
              { 'userId': 2222, 'status': 'accept' }
            ];

            const result = eventHandler.updateStatusEvent('1', '1', req, res, true, {'guestList': guestList});
            expect(result).eql('error');
            done();
          });
        });

        context('Update event', function() {
          it('update called', function(done) {
            const guestList = [
              { 'userId': 1111, 'status': 'pending' },
              { 'userId': 2222, 'status': 'pending' }
            ];

            const result = eventHandler.updateStatusEvent('1', '1', req, res, true, {'guestList': guestList});
            expect(eventHandler.model.update).to.be.called;
            done();
          });
        });

        context('responseEventUpdate', function() {
          it('Should return message error', function(done) {
            const result = eventHandler.responseEventUpdate(req, res, {}, {}, true, {});
            expect(result).eql('error');
            done();
          });

          it('Event updated', function(done) {
            const eventData = {
              'ownerId': 11111
            }
            eventHandler.responseEventUpdate(req, res, eventData, {}, true, {});

            expect(eventHandler.Users.exec).to.be.called;
            expect(res.json).to.be.called;

            done();
          });

          context('emailToOwnerEvent', function() {
            it('Should sends email', function(done) {
              eventHandler.emailToOwnerEvent(req, {}, false, {'userEmail': 'zzz@gmail.com'});
              expect(eventHandler.mailer.answerEventInvitation).to.be.called;

              done();
            });
          });
        });

      });

    });
    describe('Function: cancelEvent', function(done) {
      it('Should findOne event', function(done) {
        eventHandler.cancelEvent(req, res);
        expect(eventHandler.model.exec).to.be.called;

        done();
      });

      context('eventToCancel', function() {
        it('Should return message error', function(done) {
          const result = eventHandler.eventToCancel(req, res, '1', true, {});
          expect(result).eql('error');
          done();
        });

        context('eventData activate false', function() {
          it('Should return message error', function(done) {
            const result = eventHandler.eventToCancel(req, res, '1', false, {'active': false});
            expect(result).eql('error');
            done();
          });
        });

        context('eventData activate true', function() {
          it('Should update event', function(done) {
            eventHandler.eventToCancel(req, res, '1', false, {'active': true});
            expect(eventHandler.model.update).to.be.called;
            done();
          });
        });

        context('updateEventToCancel', function() {
          context('Error true', function() {
            it('Should return message error', function(done) {
              const result = eventHandler.updateEventToCancel(res, {}, true, {});
              expect(result).eql('error');
              done();
            });
          });

          it('Should return message success', function(done) {
            const guestList = [
              { 'userId': 1111 },
              { 'userId': 2222 }
            ];

            const result = eventHandler.updateEventToCancel(res, {'guestList': guestList}, false, {});
            expect(eventHandler.Users.exec).to.be.called;
            expect(res.json).to.be.called;
            done();
          });
          context('emailCancelEvent', function() {
            it('Should sends email', function(done) {
              eventHandler.emailCancelEvent({}, false, [{'userEmail': 'zzz@gmail.com'}]);
              expect(eventHandler.mailer.cancelEvent).to.be.called;

              done();
            });
          });
        });
      });
    });

    describe('Function: getEvents', function(done) {
      it('Should exec aggregate', function(done) {
        eventHandler.getEvents(req, res);
        expect(eventHandler.model.aggregate).to.be.called;
        done();
      });
    });
    describe('Function: getEventsPending', function(done) {
      it('Should exec aggregate', function(done) {
        eventHandler.getEventsPending(req, res);
        expect(eventHandler.model.aggregate).to.be.called;
        done();
      });
    });
    describe('Function: getMyEvents', function(done) {
      it('Should exec aggregate', function(done) {
        eventHandler.getMyEvents(req, res);
        expect(eventHandler.model.aggregate).to.be.called;
        done();
      });
    });

    describe('Function: responseGetEvents', function(done) {
      it('Should returns events', function(done) {
        eventHandler.responseGetEvents(res);
        expect(res.json).to.be.called;
        done();
      });
    });


  });

});
