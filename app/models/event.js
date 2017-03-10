var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var moment = require('moment');

var EventSchema = new Schema({
  title: { type: String, trim: true, required: "Title is required."},
  description: { type: String, trim: true, required: "Description is required."},
  dateEvent: { type: Date, required: "Date event is required."},
  guestList:   [{
                  userId: { type: Schema.Types.ObjectId, required:"Guest list is required" },
                  status: { type: String, default: 'pending' }
                }],
  ownerId: { type: Schema.Types.ObjectId, required:"Owner is required" },
  active: { type: Boolean, default: true },
  created_at: { type: Date, default: moment().utcOffset(0).format('YYYY-MM-DD HH:mm:ss.SSS') }
});

EventSchema.methods.asJson = function() {
  var event = this;
  return {
    _id: event._id,
    title: event.title,
    description: event.description,
    dateEvent: event.dateEvent,
    guestList: event.guestList
  };
};

module.exports = mongoose.model("Event", EventSchema);
