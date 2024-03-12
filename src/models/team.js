var mongoose = require("mongoose");
const isEmpty = require("../utils/isEmpty.js");
const userSchema = require("./users.js");
const teamSchema = new mongoose.Schema({
  
  manager: {
    type: userSchema,
    //required: true,
  },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  score: {
    type: Number,
    // required: true
  },
  name: {
    type: String,
    // required: true
  },
});
module.exports = mongoose.model("Teams", teamSchema);
