var mongoose = require("mongoose");

const playersSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    // required: true
  },
  yellowCards: {
    type: Number,
    // required: true
  },
  redCards: {
    type: Number,
    // required: true
  },
  goalsScored: {
    type: Number,
    // required: true
  },
  cleanSheets: {
    type: Number,
    // required: true
  },
  assist: {
    type: Number,
    // required: true
  },
});
module.exports = mongoose.model("Players", playersSchema);
