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
      ref: "Player",
    },
  ],
  yellowCards: [
    {
      player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
      cards: {
        type: Number,
        default: 0,
      },
    },
  ],
  assisters: [
    {
      player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
      assists: {
        type: Number,
        default: 0,
      },
    },
  ],
  scorers: [
    {
      player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
      goalsScored: {
        type: Number,
        default: 0,
      },
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
