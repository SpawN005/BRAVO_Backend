var mongoose = require("mongoose");
var teamSchema = require("./team");
var userSchema = require("./users");
var stadiumSchema = require("./stadium");
const playersSchema = require("./players");
const statsSchema = new mongoose.Schema({
  redCards: [
    {
      type: playersSchema,
    },
  ],
  yellowCards: [
    {
      type: playersSchema,
    },
  ],

  assisters: [
    {
      type: playersSchema,
    },
  ],
  scorers: [
    {
      type: playersSchema,
    },
  ],
});
const matchSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  team1: {
    type: teamSchema,
    required: true,
    score: {
      type: Number,
    },
  },

  team2: {
    type: teamSchema,
    // required: true
    score: {
      type: Number,
    },
  },
  referee: {
    type: userSchema,
    // required: true
  },
  stadium: {
    type: stadiumSchema,
    // required: true
  },
  stats: {
    type: statsSchema,
  },
});

module.exports = mongoose.model("Matches", matchSchema);
