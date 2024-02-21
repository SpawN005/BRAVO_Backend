var mongoose = require("mongoose");
const isEmpty = require("../utils/isEmpty.js");
const type = ["LEAGUE", "KNOCKOUT", "GROUP_KNOCKOUT"];
const breakingRules = ["NOP", "GD", "GS", "HTH", "MW", "CG"];



const ruleSchema = new mongoose.Schema({
  type: {
    type: type,
    required: true,
  },
  nbTeams: {
    type: Number,
  },

  nbPlayerPerTeam: {
    type: Number,
  },

  teamsPerPool: {
    type: Number,
    // required: true
  },
  pointsPerWin: {
    type: Number,
    // required: true
  },
  pointsPerDraw: {
    type: Number,
    // required: true
  },
  pointsPerLoss: {
    type: Number,
    // required: true
  },
  tieBreakingRules: [
    {
      type: breakingRules,
    },
  ],
});

/*
const sponsorSchema = new mongoose.Schema({
  image: {
    type: Blob,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});
*/
const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
  },

  endDate: {
    type: Date,
  },

  location: {
    type: String,
    // required: true
  },
  rules: {
    type: ruleSchema,
    // required: true
  },
  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  /*
  sponsors: [
    {
      type: sponsorSchema,
    },
  ],
  */
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      Ref: "Matches",
    },
  ],
});

module.exports = mongoose.model("Tournaments", tournamentSchema);
