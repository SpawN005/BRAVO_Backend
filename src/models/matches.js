const mongoose = require("mongoose");
const teamSchema = require("./team");
const userSchema = require("./users");
const stadiumSchema = require("./stadium");
const playerSchema = require("./players");

const matchStatSchema = require("./matchStats"); // Import matchStat schema

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
  team1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  statsTeam1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MatchStats",
  },
  team2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  statsTeam2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MatchStats",
  },
  stadium: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stadiums",
  },
});

module.exports = mongoose.model("Matches", matchSchema);