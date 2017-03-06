var expect = require('chai').expect;
var sinon = require('sinon');
var EventHandler = require('../../app/handlers/eventsHandler');

describe('eventsHandler', function() {
  var eventHandler;
  var req = {};
  GLOBAL.res = {
    'status': function() {
      return {
        'send': function() { return 'error'; }
      };
    }
  };

  beforeEach(function() {
    eventHandler = new EventHandler({});

    eventHandler.model = {
      'findOne': sinon.stub().returnsThis(),
      'select': sinon.stub().returnsThis(),
      'exec': sinon.spy()
    };

    req = {
      'current_user': {
        '_id': '999999999'
      },
      'body': {
        'eventId': '1111111111111111'
      }
    };

  });

  describe('Event', function() {
    describe('Function: updateEvent', function(done) {
      it('Find one called', function(done) {
        eventHandler.updateEvent(req);
        expect(eventHandler.model.exec).to.be.called;
        done();
      });
    });

    describe('Find Update Event', function() {
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

    });

  });

});
