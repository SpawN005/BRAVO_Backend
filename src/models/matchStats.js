const mongoose = require("mongoose");
const playerSchema = require("./players");
const teamSchema = require("./team");

const matchStatSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Matches",
  },

  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  redCards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
  yellowCards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
  assisters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
  scorers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
  score: {
    type: Number,
    default: 0,
  },
  lineup: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
});

module.exports = mongoose.model("MatchStats", matchStatSchema);