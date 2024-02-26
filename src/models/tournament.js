const mongoose = require("mongoose");
const type = ["LEAGUE", "KNOCKOUT", "GROUP_KNOCKOUT"];
const breakingRules = ["NOP", "GD", "GS", "HTH", "MW", "CG"];

const ruleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: type,
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
  },
  pointsPerWin: {
    type: Number,
  },
  pointsPerDraw: {
    type: Number,
  },
  pointsPerLoss: {
    type: Number,
  },
  tieBreakingRules: [
    {
      type: String,
      enum: breakingRules,
    },
  ],
});

const sponsorSchema = new mongoose.Schema({
  image: {
    type: String,
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

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  teams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teams',
    },
  ],
});

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
  },
  rules: {
    type: ruleSchema,
  },
  groups: [groupSchema], // Array of group objects
  sponsors: [sponsorSchema],
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Matches",
    },
  ],
});

module.exports = mongoose.model("Tournaments", tournamentSchema);
