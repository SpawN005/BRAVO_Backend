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
    ref: "Teams",
  },
  redCards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Players",
    },
  ],
  yellowCards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Players",
    },
  ],
  assisters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Players",
    },
  ],
  scorers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Players",
    },
  ],
  score: {
    type: Number,
    default: null,
  },
  lineup: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Players",
    },
  ],
});

module.exports = mongoose.model("MatchStats", matchStatSchema);