var mongoose = require("mongoose");
const isEmpty = require("../utils/isEmpty.js");
const stadiumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  address: {
    type: String,
  },

  capacity: {
    type: Number,
  },

  isAvailable: {
    type: Boolean,
    // required: true
  },
});

module.exports = mongoose.model("Stadiums", stadiumSchema);
