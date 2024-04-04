const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  date: {
    type: Date,
    // required: true,
  },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournaments",
    required: true,
  },
  stage: {
    type: String, // "group" or "knockout"
    required: true,
  },
  round: {
    type: Number,
    required: true,
  },
  team1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teams",
    // required: true,
  },
  statsTeam1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MatchStats",
  },
  team2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teams",
    // required: true,
  },
  statsTeam2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MatchStats",
  },
  stadium: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stadiums",
  },
  observer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  referee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  isWinner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teams",
  },
  nextMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Matches",
  },
  round: {
    type: Number,
  },
  status: {
    type: String,
    default: "UPCOMING",
  },
});

module.exports = mongoose.model("Matches", matchSchema);
