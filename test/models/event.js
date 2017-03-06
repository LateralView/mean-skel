var expect = require('chai').expect;
var Events = require('../../app/models/event');
var sinon = require('sinon');
var factory = require('factory-girl');

describe('Event', function () {
  describe('Invalid Event', function () {

    context('When without title', function() {
      it('Should return message error title is required', function (done) {
        factory.create("event", {title: null}, function (error, events) {
          expect(error).to.exist;
          var title_error = error.errors.title;
          expect(title_error.message).to.equal("Title is required.");
          done();
        });
      });
    });

    context('When without description', function() {
      it('Should return message error description is required', function (done) {
        factory.create("event", {description: null}, function (error, events) {
          expect(error).to.exist;
          var description_error = error.errors.description;
          expect(description_error.message).to.equal("Description is required.");
          done();
        });
      });
    });

    context('When without date event', function() {
      it('Should return message error date event is required', function (done) {
        factory.create("event", {dateEvent: null}, function (error, events) {
          expect(error).to.exist;
          var dateEvent_error = error.errors.dateEvent;
          expect(dateEvent_error.message).to.equal("Date event is required.");
          done();
        });
      });
    });

  });
});
